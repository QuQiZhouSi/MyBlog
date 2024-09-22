---
title: "题解:AT_abc219_f [ABC219F] Cleaning Robot"
summary: "这是AT_abc219_f [ABC219F] Cleaning Robot的题解,转自我的洛谷专栏,这是原题链接: https://www.luogu.com.cn/problem/solution/AT_abc219_f 这是原帖连接:https://www.luogu.com.cn/article/zfcekavw"
author: "曲奇丶宙斯"
tag: "C++ 题解 AtCoder"
---

[题目链接](https://www.luogu.com.cn/problem/solution/AT_abc219_f)
## 题解思路
1. **读取输入**:首先读取指令字符串 $S$ 及循环次数 $k$.
2. **模拟运动**:根据指令字符串 $S$ 模拟机器人在平面上的运动,记录每一个到达的位置.
3. **特判起点**:如果最终回到起点 $(0, 0)$,说明这是一个周期运动,每一个周期内的所有位置都会被清扫一次,最终结果为 $k$ 乘以一个周期内清扫的位置数.
4. **坐标处理**:
    - 如果最终横坐标或纵坐标为 $0$,则可以通过交换坐标来处理.
    - 如果最终横坐标为负值,可以通过取反处理为正值.
5. **循环计算**:
    - 计算在多次循环后被清扫的格子数.
    - 使用哈希表记录每个位置在周期内被到达的时间点,通过排序和差分计算得到所有被清扫的格子数.
6. **输出结果**:输出最终被清扫的格子数.

## 代码实现

```cpp
#include <bits/stdc++.h>
#define int long long//讨论区疑似有见祖宗人
using namespace std;
int read() {
    int sz = 0, zf = 1;
    char ch = getchar();
    while (ch < '0' || ch > '9') {
        if (ch == '-') zf = -1;
        ch = getchar();
    }
    while (ch >= '0' && ch <= '9') {
        sz = sz * 10 + (ch - '0');
        ch = getchar();
    }
    return sz * zf;
}

int k, x, y, ans;  // 定义变量:循环次数k,当前位置x,y,结果ans
string s;  // 定义指令字符串s
vector<pair<int, int>> v;  // 存储机器人经过的所有位置
map<pair<int, int>, vector<int>> mp;  // 存储经过每个位置的时间点

signed main() {
    ios::sync_with_stdio(0);  // 加速输入输出
    cin.tie(0); cout.tie(0);  // 同上

    cin >> s;  // 读取指令字符串
    k = read();  // 读取循环次数
    v.push_back({x, y});  // 初始位置(0, 0)

    // 模拟机器人运动
    for (int i = 0; i < s.size(); i++) {
        switch (s[i]) {
            case 'U': y--; break;  // 向上移动
            case 'D': y++; break;  // 向下移动
            case 'L': x--; break;  // 向左移动
            case 'R': x++; break;  // 向右移动
        }
        v.push_back({x, y});  // 记录当前位置
    }

    // 处理特殊情况:如果最终回到起点(0, 0)
    if (x == 0 && y == 0) {
        map<pair<int, int>, int> mp;  // 用于记录每个位置
        for (int i = 0; i < v.size(); i++) mp[v[i]] = 1;  // 记录位置
        cout << mp.size();  // 输出被清扫的格子数
        return 0;
    } else if (x == 0) {  // 如果最终横坐标为0,交换坐标处理
        swap(x, y);
        for (int i = 0; i < v.size(); i++) swap(v[i].first, v[i].second);
    } else if (x < 0) {  // 如果最终横坐标为负,取反处理为正
        x = -x;
        for (int i = 0; i < v.size(); i++) v[i].first = -v[i].first;
    }

    // 循环计算被清扫的格子数
    for (int i = 0; i < v.size(); i++) {
        int nx = (v[i].first % x + x) % x;
        int ny = (v[i].second - y * (v[i].first - nx) / x);
        mp[{nx, ny}].push_back((v[i].first - nx) / x);
    }

    for (auto it : mp) {
        sort(it.second.begin(), it.second.end());
        for (int i = 0; i < it.second.size() - 1; i++) 
            ans += min(k, it.second[i + 1] - it.second[i]);  // 计算最小步数
        ans += k;  // 累加总步数
    }

    cout << ans;  // 输出结果
    return 0;
}
```
