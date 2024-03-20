/**
 *
 * Reldens - FileHandler
 *
 */

const fs = require('fs');
const path = require('path');
const Logger = require('./logger');

class FileHandler
{

    constructor()
    {
        this.encoding = 'utf8';
    }

    joinPaths(...paths)
    {
        return path.join(...paths);
    }

    copyFile(from, to, folder)
    {
        fs.copyFileSync(from, path.join(folder, to));
    }

    createFolder(folderPath)
    {
        fs.mkdirSync(folderPath, { recursive: true });
    }

    async writeFile(fileName, content)
    {
        return fs.writeFile(fileName, content, this.encoding, (err) => {
            if(err){
                Logger.error('Error saving the file:', err);
                return false;
            }
            Logger.info('The file has been saved! New file name: '+fileName);
            return true;
        });
    }

}

module.exports = FileHandler;
