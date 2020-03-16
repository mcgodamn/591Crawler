
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
    },
    methods: {
        StartCrawler() {
            if (this.state.isCrawling) return

            this.$http.post('command',
                {
                    event:"StartCrawler"
                },
                { emulateJSON: true }).then(function (res) {
                    console.log(res.body)
                }, function (res) {
                    console.log(res.status)
                    console.log(res.body)
                })
        }
    },
});