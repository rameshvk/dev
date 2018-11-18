package linkinfo

import (
	"testing"
)

func TestGetImageInfo(t *testing.T) {
	url := "http://blog.oxforddictionaries.com/wp-content/uploads/monkeys2.jpg"
	if ii, err := GetImageInfo(url, ""); err != nil {
		t.Error("Unexpected error", err)
	} else if ii.MimeType != "image/jpeg" {
		t.Error("Unexpected image type", ii.MimeType)
	} else {
		sizes := [][]int{
			{32, 32},   // thumbnail
			{100, 100}, // lets see what it does for this?
			{168, 168}, // profile picture size,
			{470, 246}, // share size
		}
		infos, err := ii.Resize(sizes)
		if err != nil {
			t.Error("Resize failed with", err)
		} else {
			for jj, info := range infos {
				if info.MimeType != "image/jpeg" || info.Width != sizes[jj][0] || info.Height != sizes[jj][1] {
					t.Error("Info sizes mismatch", jj, sizes[jj], info)
				}
			}
		}
	}
}
