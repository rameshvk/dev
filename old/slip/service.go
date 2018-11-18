package slip

import (
	"encoding/json"
	"errors"
	"github.com/rameshvk/cache"
	"github.com/rameshvk/linkinfo"
	"log"
	"net/http"
	"os"
	"strings"
)

func NewSlip(s3url, region, httpHost string) *Slip {
	s3Cache := cache.NewS3ObjectCache(s3url, region)
	infoCache := cache.NewMarshaler(s3Cache, &SlipJSONEncoderDecoder{})
	return &Slip{
		ImageCache:      s3Cache,
		InfoCache:       infoCache,
		ImageExpiration: nil,
		InfoExpiration:  nil,
		ImageUrlPrefix:  "http://" + httpHost + "/image/",
		InfoUrlPrefix:   "http://" + httpHost + "/info/",
	}
}

func (slip *Slip) GetServerMux() *http.ServeMux {
	mux := http.NewServeMux()
	mux.HandleFunc("/image/", func(w http.ResponseWriter, req *http.Request) {
		key := strings.TrimPrefix(req.URL.Path, "/image/")
		bytes, _, err := slip.ImageCache.Get(key)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		} else if bytes == nil {
			http.Error(w, "Image not found", http.StatusNotFound)
		} else {
			w.Header().Add("Content-Type", "image/jpeg")
			w.Write(bytes.([]byte))
		}
	})

	mux.HandleFunc("/info/", func(w http.ResponseWriter, req *http.Request) {
		var bytes []byte
		var err error

		if req.Method == "POST" {
			url := req.URL.Query().Get("url")
			if url == "" {
				http.Error(w, "Invalid Request NO_URL_QUERY", http.StatusBadRequest)
				return
			}

			info, err := linkinfo.GetInfo(url, "")
			if err == nil && info == nil {
				log.Println("Could not fetch link info for url", url)
				err = errors.New("No info available")
			}
			if err == nil {
				info, err = slip.CacheInfo(info)
			}
			if err == nil {
				bytes, err = json.Marshal(info)
			}
		} else {
			key := strings.TrimPrefix(req.URL.Path, "/info/")
			info, _, err := slip.InfoCache.Get(key)
			if err == nil {
				bytes, err = json.Marshal(info)
			}
		}

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		} else {
			w.Header().Add("Content-Type", "application/json")
			w.Write(bytes)
		}
	})

	return mux
}

func StartService() {
	port := os.Getenv("PORT")
	if port == "" {
		panic("No PORT env var")
	}
	s3url := os.Getenv("S3URL")
	if s3url == "" {
		panic("No S3URL env var")
	}
	s3region := os.Getenv("S3REGION")
	if s3region == "" {
		panic("No S3REGION env var")
	}
	host := os.Getenv("HOST")
	if host == "" {
		panic("No HOST env var")
	}
	slip := NewSlip(s3url, s3region, host)
	handler := slip.GetServerMux()
	http.HandleFunc("/", func(w http.ResponseWriter, req *http.Request) {
		if origin := req.Header.Get("Origin"); origin != "" {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		}
		// Stop here if its Preflighted OPTIONS request
		if req.Method == "OPTIONS" {
			return
		}

		handler.ServeHTTP(w, req)
	})

	log.Fatal(http.ListenAndServe("0.0.0.0:"+port, nil))
}
