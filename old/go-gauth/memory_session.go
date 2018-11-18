// Copyright (C) 2017 Ramesh Vyaghrapuri. All rights reserved.
// Use of this source code is governed by a MIT-style license
// that can be found in the LICENSE file.

package gauth

import (
	"github.com/satori/go.uuid"
	"net/http"
	"sync"
)

// MemorySessions implements the ISessions interface
type MemorySessions struct {
	sessions map[string]*Session
	lock     sync.Mutex
}

func (m *MemorySessions) GetOrCreateSession(w http.ResponseWriter, r *http.Request) Session {
	m.lock.Lock()
	defer m.lock.Unlock()

	if m.sessions == nil {
		m.sessions = map[string]*Session{}
	}
	var sess *Session
	if cookie, err := r.Cookie("Session"); err == nil {
		sess, _ = m.sessions[cookie.Value]
	}

	if sess == nil {
		sess = &Session{ID: uuid.NewV4().String()}
		m.sessions[sess.ID] = sess
	}
	if sess.Token == nil && sess.User.Email == "" {
		sess.RedirectURL = r.URL.String()
		http.SetCookie(w, &http.Cookie{
			Name:     "Session",
			Value:    sess.ID,
			HttpOnly: true,
		})
	}
	return *sess
}

func (m *MemorySessions) UpdateSession(session Session) {
	m.lock.Lock()
	defer m.lock.Unlock()

	if m.sessions == nil {
		m.sessions = map[string]*Session{}
	}
	m.sessions[session.ID] = &session
}
