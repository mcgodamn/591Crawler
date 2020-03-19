import {
    TYPE,
    PARAMETERS
} from './data.js'

var socket = io('http://localhost:3000');
socket.on('connect', function () {
    socket.emit('whoamI',"client")
});
socket.on('crawler_result', function (data) {
    handleData(data)
});

var vm = new Vue({
    el: '#app',
    data: {
        state: {
            _isCrawling: false,
            get isCrawling() {
                return this._isCrawling
            },
            set isCrawling(crawling) {
                if (crawling) {
                    vm.logState = LogType.LOGGING
                }
                else {
                    vm.logState = LogType.NOT_LOGIN
                }
                this._isCrawling = crawling
            }
        },
        crawl_result: {
        },
        crawl_result_header: [],
    },
    methods: {
        getOptionPageHtml() {
            var html = ""
            for (var para in PARAMETERS) {
                html += getDataHtml(PARAMETERS[para])
            }
            return html
        },
        StartCrawler() {
            if (this.state.isCrawling) return
            socket.emit("command",
                {type:"start_crawler", args: {
                    kind: [2, 3], sex: [1, 3], not_cover: 1, rentprice: [5000, 7000], mrtcoods: [4232, 4231, 4184, 4200, 4182, 4183, 4181, 4180, 4179, 4178, 4177, 4176, 4175, 4174, 4173, 4233, 66265, 66264,
                        4271, 4242, 4272, 4273],
                        order: "nearby", orderType: "desc", option: ["broadband", "cold", "icebox", "wardrobe","bed"], hasimg: 1, area: [6]
                }},
                function(){
                    console.log("start now yo")
                }
            )
        },
        getTableHeaderHtml() {
            var str = `<th scope="col">#</th>`
            for (var d in this.crawl_result_header) {
                str += `<th scope="col">${this.crawl_result_header[d]}</th>`
            }
            return this.crawl_result_header.length == 0 ? "" : str
        },
        getTableDataHtml() {
            var html = ""
            var i = 1
            for (var res in this.crawl_result)
            {
                var str = `<th scope="row">${i++}</th>`
                var data = this.crawl_result[res]
                for (var d in data) {
                    str += (`<td>${data[d]}</td>`)
                }
                html += `<tr>${str}</tr>`
            }
            return this.crawl_result.length == 0 ? "" : html
        }
    },
});

function handleData(data)
{
    console.log(data)
    if (data.length == 0) {return}
    var result = data[0]
    var head = []
    for (var first_key in result)
    {
        for (var key in result[first_key])
        {
            head.push(key)
        }
        break
    }
    vm.crawl_result_header = head
    vm.crawl_result = result
}

function getDataHtml(_para)
{
    var res = ""
    switch (_para.type)
    {
        case TYPE.OPTIONS:
            res = getOptionHtml(_para)
            break

        case TYPE.RANGE:
            res = getRangeHtml(_para)
            break

        case TYPE.TWO_LEVEL_OPTIONS:
            res = get2LevelOptionHtml(_para)
            break
        default:
            break
    }

    return res
}

function getOptionHtml(_para){
    var res = `<div class="form-group row text-center">
                    <div class="col">
                        <h3 class="row text-right pl-1 accordion-toggle" data-toggle="collapse" href="#collapse_${_para.name}"
                            role="button" aria-expanded="false" aria-controls="collapse_${_para.name}">${_para.text}</h3>
                        <div class="row collapse show" id="collapse_${_para.name}">`
    for (var key in _para.data){
        var data = _para.data[key]
        res +=`<div class="form-check form-check-inline">
                    <input class="form-check-input" type="checkbox" id="${key}" v-model="${key} value=${data.value}">
                    <label class="form-check-label" for="${key}">${data.text}</label>
                </div>`
    }
    res += `</div>
        </div>
    </div>`
    return res
}
function getRangeHtml(_para) {
    return `
    <div class="form-group row text-center">
    <div class="col">
        <h3 class="row text-right pl-1 accordion-toggle" data-toggle="collapse"
            href="#collapse_${_para.name}" role="button" aria-expanded="false" aria-controls="collapse_${_para.name}">
            ${_para.text}</h3>
        <div class="row collapse show" id="collapse_${_para.name}">
            <input type="text" class="form-control col col-lg-3" placeholder="下限"
                v-model="${_para.name}_lower_bound">
            <label class="pl-2 pr-2">~</label>
            <input type="text" class="form-control col col-lg-3" placeholder="上限"
                v-model="${_para.name}_upper_bound">
        </div>
    </div>
    </div>
    `
}
function get2LevelOptionHtml(_para) {
    function getInnerOption(_data){
        var res =  `<div class="form-group row text-center">
                        <label class="col-2 pl-0 pr-0 col-form-label text-center">${_data.text}</label>
                        <div class="col text-left align-self-center">`
        for (var key in _data.items) {
            var item = _data.items[key]
            res += `<div class="form-check form-check-inline">
                        <input class="form-check-input" type="checkbox" id="${_para.name}_${item.value}"
                            value="${item.value}" v-model="${_para.name}">
                        <label class="form-check-label" for="${_para.name}_${item.value}">${item.text}</label>
                    </div>`
        }
        res += `</div>
            </div>`
        
        return res
    }

    var res = `
    <div class="form-group row text-center">
        <div class="col">
            <h3 class="row text-right pl-1 accordion-toggle" data-toggle="collapse" href="#collapse_${_para.name}"
                role="button" aria-expanded="false" aria-controls="collapse_${_para.name}">
                ${_para.text}</h3>
            <div class="collapse show" id="collapse_${_para.name}">
                <form>
    `

    for (var key in _para.data){
        res += getInnerOption(_para.data[key])
    }

    res += `</form>
        </div>
    </div>
    </div>`
    return res
}