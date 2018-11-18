package linkinfo

import (
	"net/http"
	"strings"
)

func getUrlMimeType(url string) (string, error) {
	client := &http.Client{}
	req, err := http.NewRequest("HEAD", url, nil)
	if err != nil {
		return "", nil
	}
	if resp, err := client.Do(req); err != nil {
		return "", err
	} else {
		defer resp.Body.Close()
		return getMimeTypeFromResponse(resp.Header), nil
	}
	return "", nil
}

func getMimeTypeFromResponse(header http.Header) string {
	ct := header.Get("Content-Type")
	return strings.ToLower(strings.Trim(strings.Split(ct, ";")[0], " "))
}
