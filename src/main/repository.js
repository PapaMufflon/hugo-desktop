const hugo = require('child_process').execFile
const cwd = require('cwd')
const path = require('path')
const git = require('nodegit')
const fs = require('fs')
const util = require('util')

const hugoExecFile = util.promisify(hugo)
const fsWriteFile = util.promisify(fs.writeFile)
const fsReadFile = util.promisify(fs.readFile)

async function initRepository (blogPath) {
  const repo = await git.Repository.init(blogPath, 0)
  const index = await repo.refreshIndex()
  await index.write()
  const oid = await index.writeTree()

  let author = git.Signature.create('Scott Chacon', 'schacon@gmail.com', 123456789, 60)
  let committer = git.Signature.create('Scott A Chacon', 'scott@github.com', 987654321, 90)

  await repo.createCommit('HEAD', author, committer, 'Initial commit.', oid, [])

  return repo
}

async function createGhPagesBranch (repo) {
  const commit = await repo.getHeadCommit()
  await repo.createBranch('gh-pages', commit, 0, repo.defaultSignature(), 'Created new-branch on HEAD')
}

async function createThemeSubmodule (blogRepo, relativeThemesFolder) {
  const defaultThemeSubmodule = await git.Submodule.addSetup(blogRepo, 'https://github.com/digitalcraftsman/hugo-minimalist-theme.git', relativeThemesFolder, 0)
  await defaultThemeSubmodule.init(0)
  const defaultThemeRepo = await defaultThemeSubmodule.open()
  await defaultThemeRepo.fetch('origin', null)
  const reference = await defaultThemeRepo.getReference('origin/master')
  const commit = await reference.peel(git.Object.TYPE.COMMIT)
  await defaultThemeRepo.createBranch('master', commit.id())
  await defaultThemeSubmodule.addFinalize()
  await defaultThemeRepo.checkoutBranch('master')
}

async function createDefaultPost (blogPath) {
  const postsFolder = path.join(blogPath, 'content', 'post')
  const content = `---
title: "First post"
date: ${new Date().toISOString()}
draft: true
---
This is your first post :)`

  fs.mkdirSync(postsFolder)
  await fsWriteFile(path.join(postsFolder, 'first-post.md'), content, 'utf8')
}

async function writeNewConfig (blogPath, relativeThemesFolder, blogName) {
  const destinationConfig = path.join(blogPath, 'config.toml')
  const sourceConfig = path.join(blogPath, relativeThemesFolder, 'exampleSite', 'config.toml')
  const configData = await fsReadFile(sourceConfig, 'utf8')

  const newConfigData = configData
    .replace(/# Remove[\s\S]*\.\."/g, '')
    .replace(/header_title = "Customizable header title"/g, `header_title = "${blogName}"`)

  await fsWriteFile(destinationConfig, newConfigData, 'utf8')
}

export default {
  createBlog: async (blogData) => {
    const blogPath = path.join(blogData.directory, blogData.name)
    const relativeThemesFolder = path.join('themes', 'hugo-minimalist-theme')

    try {
      await hugoExecFile(path.join(cwd(), 'hugo.exe'), ['new', 'site', blogPath])
      const blogRepo = await initRepository(blogPath)
      await createGhPagesBranch(blogRepo)
      await createThemeSubmodule(blogRepo, relativeThemesFolder)
      await createDefaultPost(blogPath)
      await writeNewConfig(blogPath, relativeThemesFolder, blogData.name)
      await fsWriteFile(path.join(blogPath, '.gitignore'), 'public', 'utf8')

      const author = git.Signature.create('Scott Chacon', 'schacon@gmail.com', 123456789, 60)
      const committer = git.Signature.create('Scott A Chacon', 'scott@github.com', 987654321, 90)
      await blogRepo.createCommitOnHead(['.gitignore', path.posix.join('archetypes', 'default.md'), 'config.toml', path.posix.join('content', 'post', 'First-post.md')], author, committer, 'Add a default theme.')
    } catch (err) {
      console.log(err)
    }

    return blogPath
  }
}
