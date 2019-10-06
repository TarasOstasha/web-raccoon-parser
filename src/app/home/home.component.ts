import { Component, OnInit } from '@angular/core';
import { start } from 'repl';
//import * as FileSystem from "fs";
var fsp = require('fs').promises;
var https = require('https')
var Stream = require('stream').Transform,
  fs = require('fs');
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  theexhibitorshandbook = [
    'https://www.theexhibitorshandbook.com/portable-displays/banner-stands/retractable'
    //'https://www.theexhibitorshandbook.com/portable-displays/banner-stands/retractable?p=2'
  ]
  // rozetka = [
  //   'https://rozetka.com.ua/mobile-phones/c80003/',
  //   'https://rozetka.com.ua/mobile-phones/c80003/page=2/'
  // ]

  //pages = this.rozetka;

  pages = this.theexhibitorshandbook;
  productList = [];
  allProductLists = [];
  constructor() { }
  slowI = 0;

  async ngOnInit() {
    //let ex = document.querySelector('#collateral-tabs >p:nth-child(2)').innerHTML;
    //1console.log('**** description', ex)

    try {
      this.slowFor();
      this.webview.openDevTools()

      this.productList.map((el) => {
        console.log('*** started', el.img)
        // this.saveImg(el.img);
      })


    } catch (error) {
      console.log(error)
    }
  }
  start(page) {
    this.pages = [page];
    this.slowFor()
  }
  slowFor() {
    //try {
    setTimeout(async () => {
      console.log('!!!!!pages length', this.slowI);
      console.log('!8!8!8!', this.pages[this.slowI]);
      this.webview.loadURL(this.pages[this.slowI]);
      this.slowI++;
      await this.grabList();
      if (this.slowI < this.pages.length) this.slowFor() //recursion
      // else { 
      //   this.slowI = 0;
      //   this.stage2()
      // }
      else if (this.slowI == this.pages.length) {
        this.slowI = 0;
        this.stage2()
      }
    }, 500)
    //} catch (error) {
    // console.log('!!!catch', error)
    // }

  }


  slowI2 = 0;
  slowFor2() {
    console.log(this.allProductLists, this.slowI2)
    setTimeout(() => {
      this.webview.loadURL(this.allProductLists[this.slowI2].link);
      this.slowI2++;
      this.grabProductPage();
      //if(this.slowI2 < this.allProductLists.length) this.slowFor2()
      if (this.slowI2 < 1) this.slowFor2()
      else this.slowI2 = 0; // finish
    }, 10000)
  }
  stage2() {
    console.log('!stage2');
    this.slowFor2();
  }
  async grabProductPage() {
    this.takeOneProduct();
  }


  async grabList() {
    this.productList = await this.getProductList();
    //this.productList = await this.getProductListRozetka();
    this.allProductLists = [...this.allProductLists, ...this.productList];
    console.log('****array of allproductlist', this.allProductLists)

    const dir = 'downloads/pages/' + this.slowI;
    console.log('!@dir', dir)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir)
    //else throw alert(dir + '- folder already exist');
    console.log('*!*!*!', this.productList)
    await fsp.writeFile(dir + '/export.json', JSON.stringify(this.productList))
    console.log('done grabbing one page');
  }
  
  webview: any = document.getElementById('wv1');
  async makeClick(select) {
    try {
      const script = `
      try {
        const button = document.querySelector('${select}');
        function eventFire(el, etype) {
          if (el.fireEvent) {
            el.fireEvent('on' + etype);
          } else {
            var evObj = document.createEvent('Events');
            evObj.initEvent(etype, true, false);
            el.dispatchEvent(evObj);
          }
        }
      
        eventFire(button, 'click')
        setTimeout(()=>{},600) // work with this!!!
        && productArray
      } catch(err) {
        console.error('error', err)
      }
      
    `
      return await this.webview.executeJavaScript(script);
    } catch (error) {
      console.log(error);
    }
  }
  async takeOneProduct() {
    try {
      const value = await this.getValueFrom('h1');
      const value2 = await this.getValueFrom('p');
      const value3 = await this.getValueFrom('.std > p');
      this.makeClick('.toggle-tabs li:nth-child(2)')
      const allValue = {
        title: value,
        content: value2,
        description: value3
      }
      const json = JSON.stringify(allValue)
      const dir = 'downloads/pages/' + this.slowI;
      await fsp.writeFile(dir + '/' + this.slowI2 + '-product.json', json)
      console.log("The file was saved!");
      // resolve through promises 
      // await fs.writeFile("export.json", json, function (err) {
      //   if (err) {
      //     return console.log(err);
      //   }
      //   console.log("The file was saved!");
      // });
    } catch (error) {
      console.log(error);
    }
  }
  async getValueFrom(selector) {
    try {
      const script = `
      var tagElement = document.querySelector('${selector}');
      setTimeout(()=>{},500)
      && tagElement.innerHTML
    `
      return await this.webview.executeJavaScript(script);
    } catch (error) {
      console.log(error);
    }
  }
  async getProductList() {
    try {
      const script = `
      var elements = document.querySelectorAll('.product-list > div');
      var productArray = [];
      for(let i = 0; i < 3; i++) {
        var data = {
          title: elements[i].querySelector('h2').innerHTML,
          text: elements[i].querySelector('p').innerHTML,
          link: elements[i].querySelector('a').href,
          img: elements[i].querySelector('img').src,
          // description: elements[i].getElementsByClassName('.std > p')
        }
        productArray.push(data);
      }
      setTimeout(()=>{},500)
      && productArray
    `
      return await this.webview.executeJavaScript(script);
    } catch (error) {
      console.log(error);
    }
  }


  async getProductListRozetka() {
    try {
      const script = `
      try {
        console.log('productlistrozetka')
        var elements = document.querySelectorAll('#catalog_goods_block .g-i-tile-catalog');
        //elements.pop();
        console.log('elements!!', elements)
        var productArray = [];
        for(let i = 0; i < elements.length-1; i++) {
          var data = {
            title: elements[i].querySelector('.g-i-tile-i-title > a').innerHTML,
            text: elements[i].querySelector('.short-description').innerHTML,
            img: elements[i].querySelector('img').src,
            link: elements[i].querySelector('a').href,
          }
          productArray.push(data);
          console.log('!!!productArray', productArray)
        }
        setTimeout(()=>{},600) // work with this!!!
        && productArray
      } catch(err) {
        console.error('error', err)
      }
      
    `
      return await this.webview.executeJavaScript(script);
    } catch (error) {
      console.log(error);
    }
  }

  saveImg(url) {
    https.request(url, function (response) {
      var data = new Stream();
      response.on('data', function (chunk) {
        data.push(chunk);
      });
      response.on('end', function () {
        const fileName = url.split('/').pop()
        fs.writeFileSync('downloads/img/' + fileName, data.read());
      });
    }).end();
  }

 
}
