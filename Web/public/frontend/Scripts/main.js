import {
    TYPE,
    PARAMETERS
} from './data.js'

startSocket()

var vm = new Vue({
    el: '#app',
    data: {
        modalShow:false,
        progressAll:1,
        progress:0,
        state: {
            _isCrawling: false,
            get isCrawling() {
                return this._isCrawling
            },
            set isCrawling(crawling) {
                this._isCrawling = crawling
                vm.modalShow = false

                if (crawling) {
                    vm.progressAll = 1
                    vm.progress = 0
                    $('#ProgressModal').modal({
                        show: true,
                        keyboard: false,
                        backdrop: 'static'
                    })

                    //debug
                    vm.modalShow = true
                    vm.progressAll = 7
                    vm.progress = 3
                }
                else {
                    $('#ProgressModal').modal('hide')
                }
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
            var parameters = getParameters()
            console.log(parameters)
            if (this.state.isCrawling) return
            this.state.isCrawling = true
            socket.emit("command",
                {
                    type: "start_crawler", args:parameters
                },
                function () {
                    console.log("start now yo")
                }
            )
        },
        CancelCrawler() {
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
            for (var res in this.crawl_result) {
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

function handleData(data) {
    console.log(data)
    if (data.length == 0) { return }
    var result = data[0]
    var head = []
    for (var first_key in result) {
        for (var key in result[first_key]) {
            head.push(key)
        }
        break
    }
    vm.crawl_result_header = head
    vm.crawl_result = result
}

function getDataHtml(_para) {
    var res = ""
    switch (_para.type) {
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

var socket
function startSocket() {
    socket = io('http://localhost:3000');
    socket.on('connect', function () {
        socket.emit('whoamI', "client")
    });
    socket.on('crawler_progress', function (data) {
        vm.modalShow = true
        if (data.progressAll === undefined) {
            vm.progress = data.progress
        } else {
            vm.progressAll = data.progressAll
        }
    });
    socket.on('crawler_result', function (data) {
        vm.state.isCrawling = false
        handleData(data)
    });
}

function getOptionHtml(_para) {
    var res = `<div class="form-group row text-center">
                    <div class="col">
                        <h3 class="row text-right pl-1 accordion-toggle" data-toggle="collapse" href="#collapse_${_para.name}"
                            role="button" aria-expanded="false" aria-controls="collapse_${_para.name}">${_para.text}</h3>
                        <div class="row collapse show" id="collapse_${_para.name}">`
    for (var key in _para.data) {
        var data = _para.data[key]
        var id = `${_para.type} ${_para.name} ${data.value}`
        res += `<div class="form-check form-check-inline">
                    <input class="form-check-input options" type="checkbox" id="${id}">
                    <label class="form-check-label" for="${id}">${data.text}</label>
                </div>`
    }
    res += `</div>
        </div>
    </div>`
    return res
}

function getRangeHtml(_para) {
    var id = `${_para.type} ${_para.name}`
    return `
    <div class="form-group row text-center">
    <div class="col">
        <h3 class="row text-right pl-1 accordion-toggle" data-toggle="collapse"
            href="#collapse_${_para.name}" role="button" aria-expanded="false" aria-controls="collapse_${_para.name}">
            ${_para.text}</h3>
        <div class="row collapse show" id="collapse_${_para.name}">
            <input type="text" class="form-control col col-lg-3 options" placeholder="下限"
                id="${id} lower_bound">
                
            <label class="pl-2 pr-2">~</label>
            <input type="text" class="form-control col col-lg-3 options" placeholder="上限"
                id="${id} upper_bound">
        </div>
    </div>
    </div>
    `
}
function get2LevelOptionHtml(_para) {
    function getInnerOption(_data) {
        var res = `<div class="form-group row text-center">
                        <label class="col-2 pl-0 pr-0 col-form-label text-center">${_data.text}</label>
                        <div class="col text-left align-self-center">`
        for (var key in _data.items) {
            var item = _data.items[key]
            var id = `${_para.type} ${_para.name} ${item.value}`
            res += `<div class="form-check form-check-inline">
                        <input class="form-check-input options" type="checkbox" id="${id}">
                        <label class="form-check-label" for="${id}">${item.text}</label>
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

    for (var key in _para.data) {
        res += getInnerOption(_para.data[key])
    }

    res += `</form>
        </div>
    </div>
    </div>`
    return res
}



function getParameters() {
    function getOptionParamter(data, obj) {
        if (!$(obj).is(':checked')) { return }

        if (!(data[1] in res)) { res[data[1]] = [] }
        if (!(res[data[1]].includes(data[2]))) { res[data[1]].push(data[2]) }
    }
    function getRangeParamter(data, obj) {
        if (!(data[1] in res)) { res[data[1]] = [] }
        var text = $(obj).val()
        switch (data[2]) {
            case "lower_bound":
                if (text == "") { text = "0" }
                res[data[1]].unshift(text);
                break
            case "upper_bound":
                if (text != "") {
                    res[data[1]].push(text);
                }
                break
        }
    }

    var res = {}

    $(".options").each(function () {
        var split = this.id.split(" ")
        switch (Number(split[0])) {
            case TYPE.OPTIONS:
            case TYPE.TWO_LEVEL_OPTIONS:
                getOptionParamter(split, this)
                break
            case TYPE.RANGE:
                getRangeParamter(split, this)
                break
        }
    });

    return res
}