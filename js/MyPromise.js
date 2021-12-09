// 实现 MyPromise
const PENDING = "pending"; // 等待；
const FULFILLED = "fulfilled"; // 成功；
const REJECTED = "rejected"; // 失败；
class MyPromise {
    constructor(executor) {
        // 表示执行器，，立即调用执行器
        executor(this.resolve, this.reject);
    }
    // promise 状态；
    status = PENDING;
    // 成功之后的值；
    value = undefined;
    // 失败之后的原因；
    reason = undefined;
    // 成功回调；
    successCallback = [];
    // 失败回调；
    failCallback = [];
    resolve = (value) => {
        // 如果状态不是等待 阻止程序向下执行；
        if (this.status !== PENDING) return;
        // 将状态改为成功；
        this.status = FULFILLED;
        // 保存成功之后的值
        this.value = value;
        // 判断成功回调是否存在，如果存在，就调用；
        // this.successCallback && this.successCallback(this.value);
        while (this.successCallback.length)
            this.successCallback.shift()(this.value);
    };
    reject = (reason) => {
        // 如果状态不是等待 阻止程序向下执行；
        if (this.status !== PENDING) return;
        // 将状态改为失败；
        this.status = REJECTED;
        // 保存失败之后的原因
        this.reason = reason;
        // 判断失败回调是否存在，如果存在，就调用；
        // this.failCallback && this.failCallback(this.reason);
        while (this.failCallback.length) this.failCallback.shift()(this.reason);
    };
    then(successCallback, failCallback) {
        // 实现 then 链式调用 ，
        let promiseObj = new MyPromise((resolve, reject) => {
            // 判断状态
            if (this.status === FULFILLED) {
                // 成功的回调函数
                // 异步获取 promiseObj 执行完后的 promise 对象
                setTimeout(() => {
                    let x = successCallback(this.value);
                    //1. 判断 x 的值是普通值还是 promise 对象；
                    //2. 如果是普通值，直接 resolve(x)返回出去；
                    //3. 如果是 promise 对象，查看 promise 对象返回的结果；
                    //4. 再根据 promise 对象返回结果，决定调用 resolve 还是 reject；
                    resolvePromise(promiseObj, x, resolve, reject);
                }, 0);
            } else if (this.status === REJECTED) {
                // 失败的回调函数
                failCallback(this.reason);
            } else {
                // 等待的状态
                // 将成功回调和失败回调存储起来 存储在数组中实现多次调用
                this.successCallback.push(successCallback);
                this.failCallback.push(failCallback);
            }
        });
        // then 方法返回的 promise 对象；
        return promiseObj;
    }
}

function resolvePromise(promiseObj, x, resolve, reject) {
    if (promiseObj === x) {
        return reject(
            new TpyeError("Chaining cycle detected for promise #<Promise>")
        );
    }
    if (x instanceof MyPromise) {
        // 是 promise 对象
        // x.then(value => resolve(value), reason => reject(reason));
        x.then(resolve, reject);
    } else {
        // 普通值
        resolve(x);
    }
}

// 测试
const myPromise = new MyPromise((resolve, reject) => {
    setTimeout((i = 0) => {
        resolve(`成功 ${++i}`);
    }, 2000);
});
myPromise.then(
    (value) => {
        console.log(value); // 成功
    },
    (reason) => {
        console.log(reason);
    }
);