# dev
Dev configuration

## External software

1. Install Chrome
2. Install iterm2
3. iterm2 -> Preferences -> Color -> Presets -> Solarized Light
4. iterm2 -> Preferences -> General -> Directory -> ~/code
8. Download golang from [here](https://golang.org/dl/)

## Git and such

1. Run: `ssh-keygen -t rsa -b 4096 -C "ramesh.vyaghrapuri@gmail.com"`
2. Choose id_rv_rsa.
3. pbcopy < ~/.ssh/id_rv_rsa.pub
4. Open: https://github.com/settings/keys
5. Paste new key.  Delete older keys
6. Repeat for LFL
7. Install git by downloading latest git.
8. `GIT_SSH_COMMAND="ssh -i ~/.ssh/id_rv_rsa.pu" git clone git@github.com:rameshvk/dev.git`
9. `cd git; . ./install.sh` <-- sets up bash profile and brings down n
10. `cd n; make install`  <-- preferably read the makefile and run the shell commands manually
11. `n latest`
