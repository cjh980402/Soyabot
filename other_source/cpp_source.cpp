#include<iostream>
using namespace std; //std 네임스페이스 사용 
int main()
{
    string my_name; 
    cout << "나의 이름은?" <<endl;
    cin >> my_name;
    cout << "입력된 나의 이름은 " << my_name << "입니다.";
    return 0;
}