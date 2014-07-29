/*-----------------------------------------------------------------------------
* @Description:     代码预编译及错误提示
* @author:          联民(lianmin.slm@alibaba-inc.com)
* @date             2014.7.13
* ==NOTES:=============================================
*  7.13:
*   将模版代码转换成纯字符串
* ---------------------------------------------------------------------------*/


var S = require('kissy');

module.exports = {
    toPureJs: function(source) {
        var
            arr = [],
            stack = [],
            code = '',
            rpc = ['p+=',';', 'p+="', '";'],
            headerCode = "function anonymous(data){var p='', line=0;\n",
            footerCode = '}\r\n';

        arr = this._getTokens(source);

        S.each(arr, function(item){
            if(item == '<%'){
                stack.push('<%')
            }else if(item == '%>'){
                //将stack中的所有语句反转出栈
                stack = stack.reverse();
                while(stack.length){
                    var s = stack.pop();
                    if(s == '<%'){
                        // pass
                    }else if(s.indexOf('=') == 0){
                        code += rpc[0] + s.substr(1) + rpc[1];
                    }else if(s == '#'){
                        code += '\n';
                    }else{
                        code += s;
                    }
                }
            }else if(item == '#'){
                if(stack.length > 0){
                    stack.push('#');
                }else{
                    code += '\n';
                }
            }else{
                if(stack.length != 0){
                    stack.push(item);
                }else if(S.trim(item) != ''){
                    code += rpc[2] + item + rpc[3];
                }
            }
        });

        return headerCode + code + footerCode;
    },
    /**
     * 将代码中 换行(以#代替) <% %> 字符串 切出
     * @param source
     * @private
     */
    _getTokens: function(source) {
        var
            arr = [];
        source = source.replace(/(\r\n)/g, '#');
        while(source){
            if(source.indexOf('<%') == 0){
                //<%
                arr.push('<%');
                source = source.substr(2);
            }else if(source.indexOf('%>') == 0){
                //%>
                arr.push('%>');
                source = source.substr(2);
            }else if(source.indexOf('#') == 0){
                //换行 #
                arr.push('#');
                source = source.substr(1);
            }else{
                // 切出离[<% %> #]最近的字符串
                var
                    a = source.indexOf('<%'),
                    b = source.indexOf('%>'),
                    c = source.indexOf('#'),
                    min;

                min = S.reduce([a,b,c],function(p,c) {
                    if(p < 0) p = 100000000;
                    if(c < 0) c = 100000000;
                    return Math.min(p,c);
                });
                arr.push(source.substr(0, min));
                source = source.substr(min);
            }
        }
        return arr;
    }
}