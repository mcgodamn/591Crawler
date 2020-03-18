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
        getHeaderHtml() {
            var str = `<th scope="col">#</th>`
            for (var d in this.crawl_result_header) {
                str += `<th scope="col">${this.crawl_result_header[d]}</th>`
            }
            return this.crawl_result_header.length == 0 ? "" : str
        },
        getDataHtml() {
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