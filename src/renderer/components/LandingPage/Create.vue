<template>
    <section class="section">
      <div class="field">
        <label class="label">Give us the name of your new blog and the location where it should be stored.</label>
        <div class="control">
          <input class="input" type="text" placeholder="Blog title" v-model="blogName">
        </div>
      </div>

      <div class="field is-grouped">
        <p class="control is-expanded">
          <input class="input" type="folder" placeholder="Local destination folder" v-model="directory">
        </p>
        <div class="control">
          <a class="button is-info" v-on:click="chooseFolder">
            Select
          </a>
        </div>
      </div>

      <div class="field is-grouped is-grouped-right">
        <p class="control">
          <a class="button is-primary" v-on:click="createBlog">
            Create
          </a>
        </p>
      </div>
    </section>
</template>

<script>
  const ipcRenderer = require('electron').ipcRenderer
  const Store = require('electron-store')
  const store = new Store()

  export default {
    name: 'create',
    data: function () {
      return {
        blogName: '',
        directory: ''
      }
    },
    methods: {
      chooseFolder: function () {
        let that = this

        require('electron').ipcRenderer.on('directory', function (event, message) {
          that.directory = message[0]
        })

        ipcRenderer.send('selectDirectory')
      },
      async createBlog () {
        const hugo = require('child_process').execFile
        const cwd = require('cwd')
        const path = require('path')
        const git = require('nodegit')
        const fs = require('fs')
        const util = require('util')

        const hugoExecFile = util.promisify(hugo)
        const fsWriteFile = util.promisify(fs.writeFile)
        const fsReadFile = util.promisify(fs.readFile)

        let blogPath = path.join(this.directory, this.blogName)
        let relativeThemesFolder = path.join('themes', 'hugo-minimalist-theme')

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

        let themesFolder = path.join(blogPath, relativeThemesFolder)
        let sourceConfig = path.join(themesFolder, 'exampleSite', 'config.toml')

        fs.mkdirSync(path.join(blogPath, 'content', 'post'))

        const configData = await fsReadFile(sourceConfig, 'utf8')

        let result = configData.replace(/# Remove[\s\S]*\.\."/g, '')
        let destinationConfig = path.join(blogPath, 'config.toml')

        await fsWriteFile(destinationConfig, result, 'utf8')

        const index = await blogRepo.refreshIndex()

        await index.addByPath('.gitignore')
        await index.addByPath(path.posix.join('archetypes', 'default.md'))
        await index.addByPath('config.toml')
        await index.write()
        const oid = await index.writeTree()

        let author = git.Signature.create('Scott Chacon', 'schacon@gmail.com', 123456789, 60)
        let committer = git.Signature.create('Scott A Chacon', 'scott@github.com', 987654321, 90)

        await blogRepo.createCommit('HEAD', author, committer, 'message', oid, [])

        let recentBlogs = store.get('recent-blogs')

        if (recentBlogs === undefined) {
          recentBlogs = []
        }

        recentBlogs.push({
          title: this.blogName,
          subtitle: '',
          path: blogPath
        })

        store.set('recent-blogs', recentBlogs)

        this.$store.commit('CHANGE_BLOG_PATH', blogPath)
        this.$router.push({path: '/editor'})
      }
    }
  }
</script>

<style>
</style>