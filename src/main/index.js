'use strict'

import { app, BrowserWindow, ipcMain, dialog } from 'electron'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */

ipcMain.on('selectDirectory', (event, arg) => {
  let dir = dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] })
  event.sender.send('directory', dir)
})

ipcMain.on('createBlog', async (event, blogData) => {
  const hugo = require('child_process').execFile
  const cwd = require('cwd')
  const path = require('path')
  const git = require('nodegit')
  const fs = require('fs')
  const util = require('util')

  const hugoExecFile = util.promisify(hugo)
  const fsWriteFile = util.promisify(fs.writeFile)
  const fsReadFile = util.promisify(fs.readFile)

  const blogPath = path.join(blogData.directory, blogData.name)
  const relativeThemesFolder = path.join('themes', 'hugo-minimalist-theme')

  await hugoExecFile(path.join(cwd(), 'hugo.exe'), ['new', 'site', blogPath])

  const blogRepo = await git.Repository.init(blogPath, 0)
  const defaultThemeSubmodule = await git.Submodule.addSetup(blogRepo, 'https://github.com/digitalcraftsman/hugo-minimalist-theme.git', relativeThemesFolder, 0)
  await defaultThemeSubmodule.init(0)
  const defaultThemeRepo = await defaultThemeSubmodule.open()
  await defaultThemeRepo.fetch('origin', null)
  const reference = await defaultThemeRepo.getReference('origin/master')
  const commit = await reference.peel(git.Object.TYPE.COMMIT)
  await defaultThemeRepo.createBranch('master', commit.id())
  await defaultThemeSubmodule.addFinalize()
  await defaultThemeRepo.checkoutBranch('master')

  await fsWriteFile(path.join(blogPath, '.gitignore'), 'public', 'utf8')
  const themesFolder = path.join(blogPath, relativeThemesFolder)
  const sourceConfig = path.join(themesFolder, 'exampleSite', 'config.toml')
  const postsFolder = path.join(blogPath, 'content', 'post')
  const content = `---
title: "First post"
date: ${new Date().toISOString()}
draft: true
---
This is your first post :)`

  fs.mkdirSync(postsFolder)
  await fsWriteFile(path.join(postsFolder, 'first-post.md'), content, 'utf8')

  const configData = await fsReadFile(sourceConfig, 'utf8')
  const newConfigData = configData
    .replace(/# Remove[\s\S]*\.\."/g, '')
    .replace(/header_title = "Customizable header title"/g, `header_title = "${blogData.name}"`)

  const destinationConfig = path.join(blogPath, 'config.toml')

  await fsWriteFile(destinationConfig, newConfigData, 'utf8')

  const index = await blogRepo.refreshIndex()

  await index.addByPath('.gitignore')
  await index.addByPath(path.posix.join('archetypes', 'default.md'))
  await index.addByPath('config.toml')
  await index.write()
  const oid = await index.writeTree()

  let author = git.Signature.create('Scott Chacon', 'schacon@gmail.com', 123456789, 60)
  let committer = git.Signature.create('Scott A Chacon', 'scott@github.com', 987654321, 90)

  await blogRepo.createCommit('HEAD', author, committer, 'message', oid, [])

  event.sender.send('blogCreated', blogPath)
})
