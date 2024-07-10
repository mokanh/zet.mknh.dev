---
title:
  - Push to all git remotes with one command
draft: 
tags:
  - seeds
  - git
---


`git remote | xargs -L1 -I R git push R master`

---

reference:
- https://stackoverflow.com/questions/5785549/able-to-push-to-all-git-remotes-with-the-one-command
