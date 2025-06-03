import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const stdout = msg => {
    console.log(msg)
    try {
        fs.appendFileSync("stdout.txt", new Date() + process.pid + " " + msg + "\n", "utf8")
    } catch (e) {
        console.error("FATAL", e)
    }
}

const stderr = msg => {
    console.error(msg)
    try {
        fs.appendFileSync("stderr.txt", new Date() + process.pid + " " + msg + "\n", "utf8")
    } catch (e) {
        console.error("FATAL", e)
    }
}

const parentDir = process.argv[2]
const days = parseInt(process.argv[3])
const delta = days * 24 * 60 * 60 * 1000 // 24 hours 60 minutes 60 seconds 1000 miliseconds
const __filename = fileURLToPath(import.meta.url)
const thisFileName = path.basename(__filename)
const red = '\x1b[31m'
const cyan = '\x1b[36m'
const reset = '\x1b[0m'
const now = new Date()

const printExample = () => {
    stdout(`run command this way: ${cyan}node ${thisFileName} <path_to_parent_dir> <delta_in_days>${reset}`)
    const exampleDir = '"c:/users/public/data"'
    const exampleDelta = 14
    stdout(`for example: ${cyan}node ${thisFileName} ${exampleDir} ${exampleDelta}${reset}`)
    stdout(`which will delete all files including direcotries (recursively) in parent directory ${exampleDir} older than ${exampleDelta} days`)
}

if (!parentDir) {
    stdout(`${red}no directory specified${reset}`)
    printExample()
    process.exit(1)
}

if (!days) {
    stdout(`${red}delta is not specified or is not numeric${reset}`)
    printExample()
    process.exit(2)
}

try {
    const files = fs.readdirSync(parentDir)
    if (files.length < 1) stdout(`directory "${parentDir}" is empty`)
    for (const dirName of files) {
        const file = path.join(parentDir, dirName)
        try {
            const stats = fs.statSync(file)
            const birthTime = new Date(stats.birthtime)
            const before = new Date(now.getTime() - delta)
            if (birthTime < before) {
                // stdout(`removing file ${file} ${birthTime} ${before}`)
                fs.rmSync(file, { recursive: true })
            } else {
                stdout(`keeping file ${file} ${birthTime} ${before}`)
            }
        } catch (e) {
            stderr("error removing file")
            stderr(e)
        }
    }
    stdout("process finished")
} catch (e) {
    stderr(e)
}
