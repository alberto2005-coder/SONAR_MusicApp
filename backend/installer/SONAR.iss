; ============================================================
; SONAR.iss — Instalador de Windows para SONAR (Inno Setup)
;
; Compilar (con Inno Setup 6 instalado):
;   ISCC.exe backend\installer\SONAR.iss
; o abrir este archivo con Inno Setup Compiler y pulsar Build.
;
; Genera: backend\build\SONAR-Setup-1.0.0.exe
;
; Nota: al instalar en "Archivos de programa" el .exe no puede
; escribir junto a sí mismo, así que SONAR guarda sus datos en
; %APPDATA%\SONAR (ya lo hace automáticamente).
; ============================================================

#define MyAppName "SONAR"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "SONAR"
#define MyAppExeName "SONAR.exe"

[Setup]
AppId={{8F3A6C7E-2B41-4D3B-9C1E-SONARMUSIC01}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
UninstallDisplayIcon={app}\{#MyAppExeName}
OutputDir=..\build
OutputBaseFilename=SONAR-Setup-{#MyAppVersion}
Compression=lzma2/max
SolidCompression=yes
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
PrivilegesRequired=lowest
PrivilegesRequiredOverridesAllowed=dialog
WizardStyle=modern
DisableProgramGroupPage=yes
SetupIconFile=..\icon\sonar.ico
UninstallDisplayName={#MyAppName}
CloseApplications=yes

[Languages]
Name: "spanish"; MessagesFile: "compiler:Languages\Spanish.isl"
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "startupicon"; Description: "Iniciar SONAR con Windows"; GroupDescription: "Inicio automático:"; Flags: unchecked

[Files]
; El .exe ya lleva todo dentro: backend, frontend y dependencias.
Source: "..\build\{#MyAppExeName}"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon
Name: "{userstartup}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: startupicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#MyAppName}}"; Flags: nowait postinstall skipifsilent

[UninstallDelete]
; Limpieza de la carpeta de datos junto al .exe (si existe)
Type: filesandordirs; Name: "{app}\SONAR_data"
