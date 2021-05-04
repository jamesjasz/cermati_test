const request = require('request');
const cheerio = require('cheerio');
const Promise = require('bluebird');
const fs = require('fs');

const home = 'https://www.cermati.com';

const scrapeHome = (home) => {
    return new Promise((resolve, reject) => {
        request(home + '/artikel', (error, response, html) => {
            if(!error && response.statusCode == 200) {
                const $ = cheerio.load(html);
                const urls = [];
    
                $('.list-of-articles a').each((i, element) => {
                    urls.push($(element).attr('href'));
                })
                
                resolve(urls);
            } else {
                reject('Error: Scraping Home');
            }
        })
    })
}

const scrapeArticle = (home, url) => {
    return new Promise ((resolve, reject) => {
        request(home + url, (error, response, html) => {
            if(!error && response.statusCode == 200) {
                const $ = cheerio.load(html);
                
                const title = $('.post-title').text();
                const author = $('.author-name').text().trim();
                const postingDate = $('.post-date').text().trim();
                const relatedArticles = [];
        
                for (let i=0; i<5; i++) {
                    let relatedArticle = new Object();
                    relatedArticle.url =  home + $('.panel-items-list a').eq(i).attr('href');
                    relatedArticle.title = $('.panel-items-list .item-title').eq(i).text();
        
                    relatedArticles.push(relatedArticle)
                };
        
                myObject = {
                    url : home+url,
                    title : title,
                    author: author,
                    postingDate: postingDate,
                    relatedArticles: relatedArticles
                }

                resolve(myObject);
            } else {
                reject('Error: Scraping Article')
            }
        })
    })
}

scrapeHome(home).then((articles) => {
    Promise.all(
        articles.map(article => scrapeArticle(home,article))
    ).then((result) => {
        const JSONFile = {
            articles: result
        }
        const solutionJSON = JSON.stringify(JSONFile);
        const fileName = "solution.json";
        fs.writeFileSync(fileName, solutionJSON);
    }).catch((error) => {
        console.log(error);
    })
}).catch((error) => {
    console.log(error);
})
