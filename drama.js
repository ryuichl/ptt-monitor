(async function() {
    try {
        const db_des = './db/drama.json'
        let db = require(db_des) 
        const keys = require('./config.json').line.notify
        const ptt_crawler = require('@waynechang65/ptt-crawler')
        const Promise = require('bluebird')
        const fs = require('fs-extra')
        const request = require('request-promise') 
        const CronJob = require('cron').CronJob 

        const line_notify = async (message) => {
            let options = {
                method : 'POST',
                uri : 'https://notify-api.line.me/api/notify',
                headers : {},
                form : {
                    message : message
                },
                json : true
            }
            const result = await Promise.map(keys, (key) => {
                options.headers.Authorization = `Bearer ${key}`
                return request(options)
            })             
            return result 
        }

        const inspect = async () => {
            await ptt_crawler.initialize({
                headless : true,
                args : ["--proxy-server='direct://'", '--proxy-bypass-list=*']
            })
            const dramas = await ptt_crawler.getResults({
                    board: 'drama-ticket',
                    pages: 1,
                    skipPBs: true,
                    getContents: false
                }).then((result) => {
                    return Promise.map(result.titles, (title, index) => {
                        return {
                            title : title,
                            url : result.urls[index],
                            rate : result.rates[index],
                            author : result.authors[index],
                            date : result.dates[index]                        
                        }
                    })
                })
            await ptt_crawler.close()
            const targets = ['李宗盛', '有歌之年']
    
            const filter_by_target = dramas.reduce((array, drama) => {
                    if (targets.some((target) => {return drama.title.includes(target)})){
                        // if (drama.title.includes('換票')){
                        // }
                        array.push(drama)
                    }
                    return array
                }, [])
            const filter_by_db = filter_by_target.reduce((array, drama) => {
                    if (db.find((list) => {return (list.title === drama.title && list.author === drama.author)})){
                        return array
                    }
                    db.push(drama)
                    array.push(drama)
                    return array
                }, [])    
            await fs.outputJson(db_des, db)
            await Promise.map(filter_by_db, (drama) => {
                return line_notify(drama.title + '\n' + drama.author + '\n' + drama.url)
            })
            // await fs.outputJson(db_des, filter_by_target)
            // console.log(filter_by_target)
            console.log(filter_by_db)
        }

        const job = new CronJob({
            cronTime : '0 * * * * *',
            onTick : async () => {
                console.log('job start')
                await inspect()
            },
            start : true,
            timeZone : 'Asia/Taipei'
        })
    }catch (err) {
        console.log(err)
    }
    // return process.exit(0)
})()