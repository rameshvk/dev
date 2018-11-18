(
  cat <<EOF
# Introduction

[![GoDoc](https://godoc.org/github.com/rameshvk/go-gauth?status.svg)](https://godoc.org/github.com/rameshvk/go-gauth)

# Install

\`\`\`
import "github.com/rameshvk/go-gauth"
\`\`\`

EOF
  godocdown | tail +4
) > README.md
