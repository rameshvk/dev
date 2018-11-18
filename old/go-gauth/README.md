# Introduction

[![GoDoc](https://godoc.org/github.com/rameshvk/go-gauth?status.svg)](https://godoc.org/github.com/rameshvk/go-gauth)

# Install

```
import "github.com/rameshvk/go-gauth"
```


Package gauth implements a very simple Google oauth for web servers

## Usage

```go
var (
	MissingStateError = errors.New("missing state query parameter")
	InvalidStateError = errors.New("invalid state query parameter")
	MissingCodeError  = errors.New("missing code query parameter")
)
```

#### func  FromCredentialsFile

```go
func FromCredentialsFile(fileName string, redirectURL string, scopes []string) (*oauth2.Config, error)
```
FromCredentialsFile creates a google auth config from a credentials file which
is expected to be in JSON format.

ClientID and ClientSecret are the two required fields in the config file.
Optional fields include RedirectURL and Scopes (the latter is expected to be an
array of strings). The optional fields can be overridden via the extra params to
the function.

#### func  Middleware

```go
func Middleware(config *oauth2.Config, s ISessions, next http.Handler) http.Handler
```
Middleware wraps the provided http.Handler with a authentication step and
returns a new handler. If the original request is unauthenticated, the google
auth flow is attempted and once it succeeds, the provided handler is called.
Note that this does not do any authorizations -- it is up to the handler to do
that by inspecting the user information (which can be fetched by calling
GetOrCreateSession)

#### func  ServeHTTP

```go
func ServeHTTP(config *oauth2.Config, s ISessions, w http.ResponseWriter, r *http.Request, next http.Handler) error
```
ServeHTTP implements method similar to http.Handler. It first checks if the
request has an associated session with valid user information. If so, it simply
passes the request over to the next http.Handler (which can find the associated
session by calling GetOrCreateSession on the sessions interface). If the request
does not have credentials, it is redirected to google and eventually google
redirects it back to the redirect url. When this method processes that request,
it takes the code provided by google and converts it to a token and redirects
the request back to the original request URL. If there is an error in this step,
it returns an error and the caller can do custom handling of errors.

Note that ServeHTTP has a special case behavior if the path is /validate_token.
In that case, it expects the POST call to have the google auth tokens provided
and it uses this to update the current session with the provided token. The
payload is a JSON dictionary with two fields: "access_token" (the actual token)
and "expires_at" (the UTC time when the token actually expires).

#### type ISessions

```go
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
```

The Sessions interface describes the mechanism used by the auth middleware to
fetch and update the session. The builtin MemorySesssion type implements this
using an in memory store.

#### type MemorySessions

```go
type MemorySessions struct {
}
```

MemorySessions implements the ISessions interface

#### func (*MemorySessions) GetOrCreateSession

```go
func (m *MemorySessions) GetOrCreateSession(w http.ResponseWriter, r *http.Request) Session
```

#### func (*MemorySessions) UpdateSession

```go
func (m *MemorySessions) UpdateSession(session Session)
```

#### type Session

```go
type Session struct {
	ID          string
	RedirectURL string
	Token       *oauth2.Token
	User        User
}
```

A session object captures the state associated with a HTTP session.

#### type User

```go
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
```

User captures the basic google user profile obtained via calls to
https://www.googleapis.com/oauth2/v3/userinfo
