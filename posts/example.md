---
title: "114514"
summary: "cnmcnmcnmcnmcnmc"
author: "ewe"
tag: "测试"
---

# Sublime 和 VS code 的配置

* 本篇文章為基礎設置,沒有任何高級的設置

## 共同設置

先下載[Mingw64](https://sourceforge.net/projects/mingw-w64/files/Toolchains%20targetting%20Win64/Personal%20Builds/mingw-builds/8.1.0/threads-win32/seh/x86_64-8.1.0-release-win32-seh-rt_v6-rev0.7z/download),下載完的壓縮包解壓到你想要的路徑

找到目錄下 $bin$ 文件夾的路徑,如我的 $C$:\ $mingw64$ \ $bin$

打開高級系統設置

![](https://cdn.luogu.com.cn/upload/image_hosting/z2sfdoei.png)

點擊環境變量



![](https://cdn.luogu.com.cn/upload/image_hosting/tcv2udrp.png)

在裏面雙擊 $Path$

![](https://cdn.luogu.com.cn/upload/image_hosting/orlo0r8j.png)

新建並輸入你之前找到的路徑即可,上圖爲新建完成后的


## Sublime



### 下載



[sublime下載鏈接](https://www.sublimetext.com/3)

![](https://cdn.luogu.com.cn/upload/image_hosting/8nhp7wks.png)



這邊建議下載Portable版本



下載完之後應該是一個壓縮包,解壓完后打開 $sublime_text.exe$ 打開以後是這樣子的(他會提示讓你更新,我這裏是更新完的)

![](https://cdn.luogu.com.cn/upload/image_hosting/46cu92hj.png)



### 中文漢化



鍵盤上按下 $Crtl$ $+$ $Shift$ $+$ $P$ 輸入 $Install$ $Package$ $Control$ 並按下 $Enter$

![](https://cdn.luogu.com.cn/upload/image_hosting/7brw4dhr.png)

過一會會彈出如下小框

![](https://cdn.luogu.com.cn/upload/image_hosting/jslx8p7o.png)

再按下 $Crtl$ $+$ $Shift$ $+$ $P$ ,輸入$Package$ $Control$ : $Install$ $Package$ 並按下 $Enter$

![](https://cdn.luogu.com.cn/upload/image_hosting/20cyjyj4.png)

出現如下狀況

![](https://cdn.luogu.com.cn/upload/image_hosting/kqk1hgh6.png)

此時再輸入 $ChineseLocalization$ 並按下 $Enter$

![](https://cdn.luogu.com.cn/upload/image_hosting/tcuzqz3u.png)

待出現如下狀況,即爲成功

![](https://cdn.luogu.com.cn/upload/image_hosting/hbxs1qtt.png)

### C++ 設置

在這個界面點擊 工具->編譯系統->新建編譯系統

![](https://cdn.luogu.com.cn/upload/image_hosting/cibxe6qe.png)

改爲如下代碼

```json
{
    "cmd": ["g++", "${file}", "-std=c++17", "-o", "${file_path}\\\\${file_base_name}", "&", "start", "cmd", "/c", "${file_path}\\\\${file_base_name} & echo. & pause"],
    "file_regex": "^(..[^:]*):([0-9]+):?([0-9]+)?:? (.*)$",
    "working_dir": "${file_path}",
    "selector": "source.c, source.c++",
    "shell": true,
    "encoding": "cp936",

    "variants": [
        {
            "name": "Build Only",
            "cmd": ["g++", "${file}", "-std=c++17", "-o", "${file_path}\\\\${file_base_name}"]
        },
        {
            "name": "Run Only",
            "cmd": ["start", "cmd", "/c", "${file_path}\\\\${file_base_name} & echo. & pause"]
        },
        {
            "name": "Build and Run",
            "cmd": [
                "g++", "${file}", "-std=c++17", "-o", "${file_path}\\\\${file_base_name}",
                "&&",
                "start", "cmd", "/c", "${file_path}\\\\${file_base_name} & echo. & pause"
            ]
        }
    ]
}



```

保存並命名爲 $C++$.$sublime$_$build$

![](C:\Users\Administrator\AppData\Roaming\Typora\typora-user-images\image-20240920110914931.png)

此時我們打開一個 $C++$ 文件,按下 $Crtl$ $+$ $Shift$ $+$ $B$ 出現以下情況後選擇 $C++$ $Biuld$

$and$ $Run$ 並按下 $Enter$

![](https://cdn.luogu.com.cn/upload/image_hosting/iiy4srpe.png)

你可以發現這就成功了



## VS code

### 下載

下載[壓縮包版](https://code.visualstudio.com/docs/?dv=winzip)的,解壓後先建一個 $data$ 文件夾

### 插件下載

點擊左邊欄最下方的那個東西進入擴展商店

下載$Chinese(Traditional)$或者$Chinese(Simplified)$和$C/C++$插件

![](https://cdn.luogu.com.cn/upload/image_hosting/9pus8hxp.png)

![](https://cdn.luogu.com.cn/upload/image_hosting/2mjnwitr.png)

### 文件夾設置

下載完後打開文件夾,并且在$.vscode$文件夾中的文件中建立如下文件

#### c_cpp_properties.json

```json
{
    "configurations": [
        {
            "name": "Win32",
            "includePath": [
                "${workspaceFolder}/**"
            ],
            "defines": [
                "_DEBUG",
                "UNICODE",
                "_UNICODE"
            ],
            "compilerPath": "C:\\mingw64\\bin\\g++.exe",
            "cStandard": "c17",
            "cppStandard": "c++17",
            "intelliSenseMode": "windows-gcc-x64"
        }
    ],
    "version": 4
}
```

#### launch.json

```json
{
    // Use IntelliSense to learn about possible attributes.
    // Hover to view descriptions of existing attributes.
    // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
    "version": "0.2.0",
    "configurations": [

        {
            "name": "(gdb) Launch",
            "preLaunchTask": "g++.exe build active file",//调试前执行的任务,就是之前配置的tasks.json中的label字段
            "type": "cppdbg",//配置类型,只能为cppdbg
            "request": "launch",//请求配置类型,可以为launch(启动)或attach(附加)
            "program": "${fileDirname}\\${fileBasenameNoExtension}.exe",//调试程序的路径名称
            "args": [],//调试传递参数
            "stopAtEntry": false,
            "cwd": "${workspaceFolder}",
            "environment": [],
            "externalConsole": false,//true显示外置的控制台窗口,false显示内置终端
            "MIMode": "gdb",
            "miDebuggerPath": "C:\\mingw64\\bin\\gdb.exe",//gdb.exe的目录
            "setupCommands": [
                {
                    "description": "Enable pretty-printing for gdb",
                    "text": "-enable-pretty-printing",
                    "ignoreFailures": true
                }
            ]
        }
    ]
}
```

#### settings.json

```json
{
    "files.associations": {
        "iostream": "cpp"
    }
}
```

#### tasks.json

```json
{
    // See https://go.microsoft.com/fwlink/?LinkId=733558 
    // for the documentation about the tasks.json format
    "version": "2.0.0",
    "tasks": [
        {
            "type": "shell",
            "label": "g++.exe build active file",//任务的名字,就是刚才在命令面板中选择的时候所看到的,可以自己设置
            "command": "C://mingw64//bin//g++.exe",//g++.exe的目录
            "args": [//编译时候的参数
                "-g",//添加gdb调试选项
                "${file}",
                "-o",//指定生成可执行文件的名称
                "${fileDirname}\\${fileBasenameNoExtension}.exe"
            ],
            "options": {
                "cwd": "C://mingw64//bin"//编译器bin的文件夹
            },
            "problemMatcher": [
                "$gcc"
            ],
            "group": {
                "kind": "build",
                "isDefault": true//表示快捷键Ctrl+Shift+B可以运行该任务
            }
        }
    ]
}
```



注意:你要把文件中的$C$ :\ $mingw64$ \ $bin$改爲你的路徑,注意 \ 數量不要打錯,分清 \ 和 /

再進行測試,打開一個$C++$ 文件,按下F5編譯

出現如下情況即爲成功



![](https://cdn.luogu.com.cn/upload/image_hosting/p2djc0vc.png)

