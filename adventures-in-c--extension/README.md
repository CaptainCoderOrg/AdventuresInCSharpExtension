# Adventures in C# Companion Extension

This is the official extension for Captain Coder's Adventures in C#. This extension allows you to load and run
examples from the website directly into VS Code simply by clicking a button.

## Features

This extension provides support for loading examples from Captain Coder's Adventures in C# quickly into
VS Code so you can modify and run them. After clicking a link in the book, a Program.cs file will be
loaded and executed in a terminal. To run the example again, you can run the `Adventures in C#: Run Shared Program`
from the command pallette.

### Sharing Simple Program.cs Files

This extension provides support for sharing simple top level `Program.cs` files. When editing a `Program.cs` file
you can click the share button in the editor menu:

![Preview of Share Button](https://raw.githubusercontent.com/CaptainCoderOrg/AdventuresInCSharpExtension/main/adventures-in-c--extension/images/click-share.png)

The generated URL provides a link that will open the `Program.cs` file in VS Code. When such a file is active, it can
be run by using the `Adventures in C#: Run Shared Program` command or by clicking the run button in the editor menu:

![Run Shared Program](https://raw.githubusercontent.com/CaptainCoderOrg/AdventuresInCSharpExtension/main/adventures-in-c--extension/images/click-run.png)


## Requirements

This extension assumes you have .NET 6 installed on your system.

## Extension Settings

This extension does not add any settings.

## Known Issues

No known issues.

## Release Notes

### 0.0.5 - Beta Release

Update extension to use POST method for generating URLs.

### 0.0.4 - Beta Release

Add support for Generating and loading Shareable URLs.

### 0.0.1 - Beta Release

Basic URI functionality for loading simple example code from the web into VS Code.
