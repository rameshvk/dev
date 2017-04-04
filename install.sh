# source this file.
cp .bashrc ~/  &&
cp .bash_profile ~/ &&
cp .gitconfig ~/ &&
cp .emacs ~/ &&
(
  if [ -z "$GOPATH" ]; then
    . .bashrc
  fi  
) &&
(
  if [ -d n ]; then
    echo skipping installing n
  else
    git clone git@github.com:tj/n.git
  fi
) &&
mkdir ~/dev/go &&
go get github.com/robertkrimen/godocdown/godocdown &&




