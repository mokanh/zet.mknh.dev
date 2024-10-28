

### Step 1: Connect the External Hard Drive to Your Mac
- Plug in your external hard drive to your Mac.

### Step 2: Open Terminal
- Open the **Terminal** application. You can find it by searching "Terminal" in **Spotlight** (press `Cmd + Space` and type "Terminal").

### Step 3: Navigate to the External Hard Drive
- First, you need to identify the mount point of your external drive. Type the following command to list all volumes:

  ```bash
  ls /Volumes/
  ```

  Find your external hard drive in the list. It will usually have the name of the drive.

- Navigate to your external drive by using the `cd` command. Replace `[DriveName]` with the name of your drive:

  ```bash
  cd /Volumes/[DriveName]
  ```

### Step 4: Delete Suspicious Files
- To delete `.lnk` files or an `autorun.inf` file:

  ```bash
  rm *.lnk
  rm autorun.inf
  ```

  If you suspect other malicious files with different extensions (like `.exe`), you can delete those as well:

  ```bash
  rm *.exe
  ```

### Step 5: Change File Attributes
- On macOS, the `attrib` command from Windows is not available. However, you can remove the hidden, read-only, or system attributes using the `chflags` command:

  ```bash
  chflags nohidden /Volumes/[DriveName]/*
  ```

  This will remove the hidden attribute from all files in your external drive. The other attributes (read-only, system) are not typically managed with the same commands in macOS as they are in Windows, so if the files are still acting strangely, further investigation might be needed.

### Step 6: Recovering Data
https://7datarecovery.com/blog/recover-data-from-flash-drive-mac/

### Notes:
- macOS does not have direct equivalents for some Windows commands like `attrib`. If you suspect a virus, it’s a good idea to use an antivirus program that supports macOS to scan your external drive. 

This should allow you to perform similar actions on macOS as you would on a Windows PC.


