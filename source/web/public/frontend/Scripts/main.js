import {
    TYPE,
    PARAMETERS,
    STRING
} from './data.js'

startSocket()

var vm = new Vue({
    el: '#app',
    data: {
        progressText: "",
        optionShow: true,
        resultShow: false,
        modalShow:false,
        progress: {
            _all:1,
            _now:0,
            get all() {
                return this._all
            },
            set all(value) {
                this._all = value
            },
            get now() {
                return this._now
            },
            set now(value) {
                this._now = value
                updateProgressCircle((value/this._all) * 100)
            }
        },
        state: {
            _isCrawling: false,
            get isCrawling() {
                return this._isCrawling
            },
            set isCrawling(crawling) {
                this._isCrawling = crawling
                vm.modalShow = false

                if (crawling) {
                    vm.progress.all = 1
                    vm.progress.now = 0
                    $('#ProgressModal').modal({
                        show: true,
                        keyboard: false,
                        backdrop: 'static'
                    })
                }
                else {
                    $('#ProgressModal').modal('hide')
                    vm.resultShow = true
                }
            }
        },
        crawl_result: {test:'fuck'},
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
            if (this.state.isCrawling) return
            this.state.isCrawling = true
            vm.progressText = STRING.progresing
            updateProgressCircle(0)
            socket.emit("command",
                {
                    type: "start_crawler",
                    args:parameters
                },
                function () {
                    console.log("start now yo")
                }
            )
        },
        CancelCrawler() {
            vm.progressText = STRING.canceling
            socket.emit("command",
                {
                    type: "cancel_crawler",
                    args: null
                },
                function () {
                    console.log("cancel yo")
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
            for (var res in this.crawl_result) {
                var str = `<th scope="row">${i++}</th>`
                var data = this.crawl_result[res]
                for (var d in data) {
                    str += (`<td>${
                        ((d == "url") ? "<a href=\"" + data[d] + "\">" : "")
                        + data[d] +
                        ((d == "url") ? "</a>" : "")
                    }</td>`)
                }
                html += `<tr>${str}</tr>`
            }
            return this.crawl_result.length == 0 ? "" : html
        }
    },
});

function handleData(data) {
    console.log(data)
    if (data == null || data.length == 0) { return }
    var head = []
    for (var first_key in data) {
        for (var key in data[first_key]) {
            head.push(key)
        }
        break
    }

    vm.crawl_result_header = head
    vm.crawl_result = data
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
        // //Debug
        // socket.emit("command",
        // {
        //     type: "start_crawler",
        //     args: {
        //         kind: [ '1' ],
        //         sex: [ '1' ],
        //         distance: [ '', '1000' ],
        //         patternMore: [ '1' ],
        //         rentprice: [ '', '15000' ],
        //         mrtcoods: [ '4234' ]
        //     }
        // })
    });
    socket.on('crawler_progress', function (res) {
        vm.modalShow = true
        if (res.progressAll === undefined) {
            vm.progress.now = res.progress
        } else {
            vm.progress.all = res.progressAll
        }
    });
    socket.on('crawler_result', function (data) {
        vm.state.isCrawling = false
        if (data.error)
        {
            window.alert("有地方出錯了!");
            console.log("stop crawler because " + data.error);
        }
        else
        {
            handleData(data)
        }
    });
}

function getOptionHtml(_para) {
    var res = `<div class="form-group row text-center">
                    <div class="col">
                        <h3 class="row text-right pl-1 accordion-toggle" data-toggle="collapse" href="#collapse_${_para.name}"
                            role="button" aria-expanded="false" aria-controls="collapse_${_para.name}"><b>${_para.text}</b></h3>
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
            href="#collapse_${_para.name}" role="button" aria-expanded="false" aria-controls="collapse_${_para.name}"><b>
            ${_para.text}</b></h3>
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
                        <label class="col-2 pl-0 pr-0 col-form-label text-center"><b>${_data.text}</b></label>
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
                <b>${_para.text}</b></h3>
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
    function addDefault(_res) {
        for (var p in PARAMETERS) {
            var para = PARAMETERS[p]
            if (("default" in para) && !(para.name in _res)) {
                var defaultValue
                if (para.default.length != 0) {
                    defaultValue = Object.assign([], para.default)
                } else {
                    defaultValue = []
                    if (para.type == TYPE.TWO_LEVEL_OPTIONS) {
                        for (var data in para.data) {
                            for (var item in para.data[data].items) {
                                defaultValue.push(para.data[data].items[item].value)
                            }
                        }
                    } else if (para.type == TYPE.OPTIONS) {
                        for (var data in para.data) {
                            defaultValue.push(para.data[data].value)
                        }
                    } else if (para.type == TYPE.RANGE) {
                        defaultValue = ["",""]
                    }
                }
                _res[para.name] = defaultValue
            }
        }
        return _res  
    }

    function getOptionParamter(data, obj) {
        if (!$(obj).is(':checked')) { return }

        if (!(data[1] in res)) { res[data[1]] = [] }
        if (!(res[data[1]].includes(data[2]))) { res[data[1]].push(data[2]) }
    }
    function getRangeParamter(data, obj) {
        var text = $(obj).val()
        if (text == "") {return}

        if (!(data[1] in res)) { res[data[1]] = ["", ""] }
        switch (data[2]) {
            case "lower_bound":
                res[data[1]][0] = text
                break
            case "upper_bound":
                res[data[1]][1] = text
                if (res[data[1]][1] == "") {
                    res[data[1]][1] = "0"
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

    return addDefault(res)
}

function updateProgressCircle(value) {
    $(".progress").each(function () {

        var left = $(this).find('.progress-left .progress-bar');
        var right = $(this).find('.progress-right .progress-bar');

        if (value >= 0) {
            if (value <= 50) {
                right.css('transform', 'rotate(' + percentageToDegrees(value) + 'deg)')
                left.css('transform', 'rotate(' + percentageToDegrees(0) + 'deg)')
            } else {
                right.css('transform', 'rotate(180deg)')
                left.css('transform', 'rotate(' + percentageToDegrees(value - 50) + 'deg)')
            }
        }
    })
}

function percentageToDegrees(percentage) {
    return percentage / 100 * 360
}