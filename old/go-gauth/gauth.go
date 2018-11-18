// Copyright (C) 2017 Ramesh Vyaghrapuri. All rights reserved.
// Use of this source code is governed by a MIT-style license
// that can be found in the LICENSE file.

// Package gauth implements a very simple Google oauth for web servers
package gauth

import (
	"encoding/json"
	"errors"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"time"
)

var (
	MissingStateError = errors.New("missing state query parameter")
	InvalidStateError = errors.New("invalid state query parameter")
	MissingCodeError  = errors.New("missing code query parameter")
)

// FromCredentialsFile creates a google auth config from a credentials file
// which is expected to be in JSON format.
//
// ClientID and ClientSecret are the two required fields in the config file.
// Optional fields include RedirectURL and Scopes (the latter is expected to
// be an array of strings).  The optional fields can be overridden via the
// extra params to the function.
func FromCredentialsFile(fileName string, redirectURL string, scopes []string) (*oauth2.Config, error) {
	var config oauth2.Config

	if data, err := ioutil.ReadFile(fileName); err != nil {
		return nil, err
	} else if err = json.Unmarshal(data, &config); err != nil {
		return nil, err
	}

	if redirectURL != "" {
		config.RedirectURL = redirectURL
	}

	if scopes != nil {
		config.Scopes = scopes
	} else if config.Scopes == nil {
		config.Scopes = []string{"https://www.googleapis.com/auth/userinfo.email"}
	}

	config.Endpoint = google.Endpoint
	return &config, nil
}

// User captures the basic google user profile obtained via calls to
// https://www.googleapis.com/oauth2/v3/userinfo
type User struct {
	Sub           string `json:"sub"`
	Name          string `json:"name"`
	GivenName     string `json:"given_name"`
	FamilyName    string `json:"family_name"`
	Profile       string `json:"profile"`
	Picture       string `json:"picture"`
	Email         string `json:"email"`
	EmailVerified bool   `json:"email_verified"`
	Gender        string `json:"gender"`
}

type userinfoError struct {
	Error       string `json:"error"`
	Description string `json:"error_description"`
}

// A session object captures the state associated with a HTTP session.
type Session struct {
	ID          string
	RedirectURL string
	Token       *oauth2.Token
	User        User
}

// The Sessions interface describes the mechanism used by the auth middleware
// to fetch and update the session.  The builtin MemorySesssion type implements this
// using an in memory store.
type ISessions interface {
	// GetOrCreateSession is expected to inspect the Request and decide if there is
	// an associated session already.  This can be done using cookies or some other
	// mechanism. If there is no session (or maybe the session is stale), a new session
	// is expected to be created and associated with the client.
	GetOrCreateSession(w http.ResponseWriter, r *http.Request) Session

	// UpdateSession updates the cached sessino with new values. This method is used
	// when the google auth succeeds and there is a new token + user information.
	UpdateSession(session Session)
}

func isRedirectURL(config *oauth2.Config, r *http.Request) bool {
	if configURL, err := url.Parse(config.RedirectURL); err != nil {
		return false
	} else {
		return configURL.Path == r.URL.Path
	}
}

func getTokenInfo(r *http.Request) (*oauth2.Token, error) {
	if r.URL.Path != "/validate_token" || r.Method != "POST" || r.Body == nil {
		return nil, nil
	}
	// format of payload is described here
	// https://developers.google.com/identity/sign-in/web/reference#googleusergetauthresponseincludeauthorizationdata
	info := struct {
		AccessToken string  `json:"access_token"`
		ExpiresAt   float64 `json:"expires_at"`
	}{}

	defer r.Body.Close()
	if data, err := ioutil.ReadAll(r.Body); err != nil {
		return nil, err
	} else if err := json.Unmarshal(data, &info); err != nil {
		return nil, err
	} else {
		return &oauth2.Token{
			AccessToken: info.AccessToken,
			TokenType:   "Bearer",
			Expiry:      time.Unix(int64(info.ExpiresAt), 0),
		}, nil
	}
}

func validateToken(config *oauth2.Config, token *oauth2.Token) (*User, error) {
	var user User
	var apiError userinfoError
	client := config.Client(oauth2.NoContext, token)
	url := "https://www.googleapis.com/oauth2/v3/userinfo"
	if resp, err := client.Get(url); err != nil {
		return nil, err
	} else {
		defer resp.Body.Close()
		if data, err := ioutil.ReadAll(resp.Body); err != nil {
			return nil, err
		} else if err := json.Unmarshal(data, &user); err != nil {
			return nil, err
		} else if err := json.Unmarshal(data, &apiError); err == nil && apiError.Error != "" {
			return nil, errors.New(apiError.Error)
		}
	}
	return &user, nil
}

// Middleware wraps the provided http.Handler with a authentication step and returns a
// new handler.  If the original request is unauthenticated, the google auth flow is
// attempted and once it succeeds, the provided handler is called.
// Note that this does not do any authorizations -- it is up to the handler to do that
// by inspecting the user information (which can be fetched by calling GetOrCreateSession)
func Middleware(config *oauth2.Config, s ISessions, next http.Handler) http.Handler {
	return &middleware{config, s, next}
}

// ServeHTTP implements method similar to http.Handler.  It first checks if the request
// has an associated session with valid user information.  If so, it simply passes the
// request over to the next http.Handler (which can find the associated session by calling
// GetOrCreateSession on the sessions interface).
// If the request does not have credentials, it is redirected to google and eventually
// google redirects it back to the redirect url.  When this method processes that request,
// it takes the code provided by google and converts it to a token and redirects the request
// back to the original request URL.  If there is an error in this step, it returns an error
// and the caller can do custom handling of errors.
//
// Note that ServeHTTP has a special case behavior if the path is /validate_token.  In that
// case, it expects the POST call to have the google auth tokens provided and it uses this to
// update the current session with the provided token.  The payload is a JSON dictionary with
// two fields: "access_token" (the actual token) and "expires_at" (the UTC time when the token
// actually expires).
func ServeHTTP(config *oauth2.Config, s ISessions, w http.ResponseWriter, r *http.Request, next http.Handler) error {
	var e error
	sess := s.GetOrCreateSession(w, r)

	if tok, err := getTokenInfo(r); err != nil {
		e = err
	} else if tok != nil {
		if user, err := validateToken(config, tok); err != nil {
			e = err
		} else {
			sess.Token = tok
			sess.User = *user
			sess.RedirectURL = ""
			s.UpdateSession(sess)
			w.Write([]byte{})
		}
	} else if !isRedirectURL(config, r) {
		if sess.Token == nil && sess.User.Email == "" {
			http.Redirect(w, r, config.AuthCodeURL(sess.ID), http.StatusTemporaryRedirect)
		} else {
			// have session info! call the next handler
			next.ServeHTTP(w, r)
		}
	} else if parts, ok := r.URL.Query()["state"]; !ok {
		e = MissingStateError
	} else if parts[0] != sess.ID {
		e = InvalidStateError
	} else if parts, ok := r.URL.Query()["code"]; !ok {
		e = MissingCodeError
	} else if tok, err := config.Exchange(oauth2.NoContext, parts[0]); err != nil {
		e = err
	} else if user, err := validateToken(config, tok); err != nil {
		e = err
	} else {
		sess.Token = tok
		sess.User = *user
		sess.RedirectURL = ""
		s.UpdateSession(sess)
		http.Redirect(w, r, sess.RedirectURL, http.StatusTemporaryRedirect)
	}
	return e
}

type middleware struct {
	config   *oauth2.Config
	sessions ISessions
	next     http.Handler
}

func (m *middleware) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if err := ServeHTTP(m.config, m.sessions, w, r, m.next); err != nil {
		log.Println("Failed with error", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
	}
}
