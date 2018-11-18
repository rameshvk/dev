// Copyright (C) 2017 Ramesh Vyaghrapuri. All rights reserved.
// Use of this source code is governed by a MIT-style license
// that can be found in the LICENSE file.

package gauth_test

import (
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/rameshvk/go-gauth"
	"io/ioutil"
	"net/http"
	"os"
	"time"
)

// Example_validateTokenTest attempts to run through the /validate_token code path.
// It expects two environment variables to be set: TOKEN and CONFIG
//
// CONFIG is expected to be a google credentials config.json file compatabile with
// gauth.FromCredentialsFile.
//
// TOKEN is expected to be a valid gauth token matching the CONFIG.
//
// A valid token can be otained from https://developers.google.com.oauthplayground/
// Please remember to change the playground settings to use client-side authentication
// with your custom clientId and ensure that the authorization scopes include
// https://www.googleapis.com/auth/userinfo.email
//
func Example_validateTokenTest() {
	configEnv := os.Getenv("CONFIG")
	tokenEnv := os.Getenv("TOKEN")

	if configEnv == "" || tokenEnv == "" {
		fmt.Println("Please see the documentation of Example_validateTokenTest; missing environment variables")
		return
	}

	// Start Server
	if config, err := gauth.FromCredentialsFile(configEnv, "http://localhost:6060/gauth", nil); err != nil {
		fmt.Println("Could not open config file", configEnv)
	} else {
		server := &http.Server{}
		defer server.Close()
		server.Handler = gauth.Middleware(config, &gauth.MemorySessions{}, nil)
		server.Addr = ":6060"
		go server.ListenAndServe()
	}

	// format token
	tokenInfo := map[string]interface{}{
		"access_token": tokenEnv,
		"expires_at":   float64(time.Now().Unix() + 2000),
	}
	token, _ := json.Marshal(tokenInfo)

	// make validate_token call
	resp, err := http.Post("http://localhost:6060/validate_token", "application/json", bytes.NewReader(token))
	if err != nil {
		fmt.Println("Failed with error", err)
	} else if resp.StatusCode != http.StatusOK {
		fmt.Println("Failed with status", resp.Status)
	} else {
		defer resp.Body.Close()
		body, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			fmt.Println("Failed reading body", err)
		} else if len(body) == 0 {
			fmt.Println("Succeeded!")
		} else {
			fmt.Println("Unexpected body", string(body[0:10]))
		}
	}

	// Output: Succeeded!
}

// Example_authFailureTest validates that new requests are redirected to google for auth
// It expects two environment variables to be set: TOKEN and CONFIG
//
// CONFIG is expected to be a google credentials config.json file compatabile with
// gauth.FromCredentialsFile.
//
// TOKEN is expected to be a valid gauth token matching the CONFIG.
//
// A valid token can be otained from https://developers.google.com.oauthplayground/
// Please remember to change the playground settings to use client-side authentication
// with your custom clientId and ensure that the authorization scopes include
// https://www.googleapis.com/auth/userinfo.email
//
func Example_authFailureTest() {
	configEnv := os.Getenv("CONFIG")

	if configEnv == "" {
		fmt.Println("Please provide CONFIG environmenet variable (see Example_authFailureTest doc)")
		return
	}

	// Start Server
	if config, err := gauth.FromCredentialsFile(configEnv, "http://localhost:6060/gauth", nil); err != nil {
		fmt.Println("Could not open config file", configEnv)
	} else {
		server := &http.Server{}
		defer server.Close()
		server.Handler = gauth.Middleware(config, &gauth.MemorySessions{}, nil)
		server.Addr = ":6060"
		go server.ListenAndServe()
	}

	// make validate_token call
	client := &http.Client{CheckRedirect: func(r *http.Request, via []*http.Request) error { return http.ErrUseLastResponse }}
	resp, err := client.Get("http://localhost:6060/some_path")
	if err != nil {
		fmt.Println("Failed with error", err)
	} else if resp.StatusCode != http.StatusTemporaryRedirect {
		fmt.Println("Failed with status", resp.Status)
	} else if loc, err := resp.Location(); err != nil {
		fmt.Println("Failed to get redirect location", err)
	} else if loc.Host != "accounts.google.com" {
		fmt.Println("Strange redirect location", loc)
	} else {
		fmt.Println("Succeeded!")
	}

	// Output: Succeeded!
}
