Name "Turtl"
OutFile "..\..\turtl-windows.exe"
InstallDir $PROGRAMFILES\Turtl
DirText "This will install Turtl on your computer."

Section ""
	SetOutPath $INSTDIR
	File /r *
	writeUninstaller "$INSTDIR\uninstall.exe"
	CreateShortcut "$SMPROGRAMS\Turtl.lnk" "$INSTDIR\turtl.exe"
	WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\Turtl" \
		"DisplayName" "Turtl (Lyon Bros. Enterprises, LLC)"
	WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\Turtl" \
		"UninstallString" "$\"$INSTDIR\uninstall.exe$\""
SectionEnd

Section "uninstall"
	RmDir /r "$INSTDIR"
	Delete "$SMPROGRAMS\Turtl.lnk"
	DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\Turtl"
SectionEnd
