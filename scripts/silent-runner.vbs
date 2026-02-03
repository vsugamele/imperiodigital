Set shell = CreateObject("WScript.Shell")
args = ""
For Each arg In WScript.Arguments
    args = args & " " & chr(34) & arg & chr(34)
Next
shell.Run "cmd.exe /c " & args, 0, False
