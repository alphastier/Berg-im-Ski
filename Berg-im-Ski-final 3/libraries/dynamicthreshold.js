function dynamicThreshold(_n, _difficulty) {

    var values = [];
    var thres = 0;
    var difficulty = _difficulty || 0.85;
    //how many measurements to take into account
    var n = _n || 200;

    function my() {

    }


    function dtmean(arr) {
        var sum = 0;

        arr.forEach(function(d) {
            sum += d;
        });

        return arr.length == 0 ? 0 : sum / arr.length;

    }

    my.threshold = function(val) {
        if (val && !isNaN(val)) {
            values.push(val);
        }
        
        while (values.length > n) {
            values.shift();
        }

        var _mean = dtmean(values);

        thres = difficulty * _mean;
        return thres;
    }

    return my;
}