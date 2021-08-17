// 用于ci自动复制发布文件到网站服务器

const fs = require('fs');
const path = require('path');

function copyRecursive(src, dst, skipExists = false) {
  if (fs.existsSync(src)) {
    if (fs.statSync(src).isDirectory()) {
      fs.readdirSync(src).forEach(file => {
        copyRecursive(path.join(src, file), path.join(dst, file), skipExists);
      });
    } else {
      let dir = path.dirname(dst);
      if (!fs.existsSync(dir)) {
        console.log(`mkdir ${dir}`);
        fs.mkdirSync(dir, { recursive: true });
      }
      if (skipExists && fs.existsSync(dst)) {
        console.log(`skip copy ${src} to ${dst} because file exists`);
      } else {
        console.log(`copy ${src} to ${dst}`);
        fs.copyFileSync(src, dst);
      }
    }
  } else {
    console.log(`${src} not exists!`);
  }
}

function deleteRecursive(dir) {
  if (fs.existsSync(dir)) {
    if (fs.statSync(dir).isDirectory()) {
      fs.readdirSync(dir).forEach(file => {
        deleteRecursive(path.join(dir, file));
      });
      console.log(`delete ${dir}`);
      fs.rmdirSync(dir)
    } else {
      console.log(`delete ${dir}`);
      fs.unlinkSync(dir);
    }
  } else {
    console.log(`${dir} not exists!`);
  }
}

if (process.argv.length !== 4) {
  console.log("error: require args: destination buildNumber")
  process.exit(1);
} else {
  let destinationRoot = process.argv[2];
  let buildNumber = process.argv[3];
  if (fs.existsSync(destinationRoot) && fs.statSync(destinationRoot).isDirectory()) {
    let oldFileMoved = [];
    let newDist = [];
    fs.readdirSync(path.join(__dirname, 'dist')).forEach(distContent => {
      const copyBlacklist = ['.nojekyll', 'v3_static', 'favicon.ico'];
      if (copyBlacklist.indexOf(distContent) === -1) {
        newDist.push(distContent);
      }
    });
    newDist.forEach(distContent => {
      let newFile = path.join(__dirname, 'dist', distContent);
      let newFileTemp = `${path.join(destinationRoot, distContent)}.build${buildNumber}`;
      copyRecursive(newFile, newFileTemp);
    });
    let srcStaticDir = path.join(__dirname, 'dist', 'v3_static');
    let targetStaticDir = path.join(destinationRoot, 'v3_static');
    if (!fs.existsSync(targetStaticDir)) {
      fs.mkdirSync(targetStaticDir);
      console.log(`mkdir ${targetStaticDir}`);
    }
    copyRecursive(srcStaticDir, targetStaticDir, true);
    copyRecursive(path.join(srcStaticDir, 'v3_commits.json'), path.join(targetStaticDir, 'v3_commits.json'));
    newDist.forEach(distContent => {
      let oldFile = path.join(destinationRoot, distContent);
      if (fs.existsSync(oldFile)) {
        let moveName = `${oldFile}.old.build${buildNumber}`;
        console.log(`rename old file ${oldFile} to ${moveName}`);
        fs.renameSync(oldFile, moveName);
        oldFileMoved.push(moveName);
      }
    });
    newDist.forEach(distContent => {
      let newFile = path.join(destinationRoot, distContent);
      let newFileTemp = `${newFile}.build${buildNumber}`;
      console.log(`rename new file ${newFileTemp} to ${newFile}`);
      fs.renameSync(newFileTemp, newFile);
    });
    oldFileMoved.forEach(old => {
      deleteRecursive(old);
    });
    console.log('publish done');
  } else {
    console.log("destination is not a directory.");
    process.exit(1);
  }
}
