package linkinfo

import (
	"testing"
)

func TestUrlInfo(t *testing.T) {
	mimeType, err := getUrlMimeType(usaTodayUrl)
	if mimeType != "text/html" || err != nil {
		t.Error("Unexpected mime type", mimeType, err)
	}
}
