"use clinet"
import { supabase } from "@/utils/supabase/supabase";
import React from "react";
import {useEffect,useState} from "react";

export default function Admin(){
    const [user,setUser] = useState<null|object>(null);
    const [loading,setLoding] = useState(false);

    // プロフィール情報の関数を追加
    const [myprof, setMyprof] = useState<{
        id?: string;
        avatar_url?: string;
        updated_at?: string;
        full_name?: string;
    } | null>(null);

    // 送信機能
    const profSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log("ユーザー情報を更新");
    };

    
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    
    const updateChange = () => {
        
        console.log("アイコンを更新");
    };
    
    useEffect(()=>{
        const getUser = async()=>{
            const {data,error} = await supabase.auth.getUser();
            if(error){
                console.log("ユーザー情報の取得に失敗",error)
            }else{
                setUser(data.user);
            }
            setLoding(false);
        }
        getUser();
    },[])
    if (loading){
    return<p>ローディング中</p>
    }

    if(!user){
        return<p>ユーザー情報がありません。</p>
    }

    return(
        <>
        <div>
      <h1>フリーランス管理画面</h1>
      <p>ログインユーザー：{(user as any).email}</p>
      <p>権限:{(user as any).role}</p>
       <form onSubmit={profSubmit} className="mx-auto mt-16 max-w-xl sm:mt-20">
                            <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label htmlFor="myprof" className="block text-sm font-semibold text-gray-900">
                                        Username
                                    </label>
                                    <div className="mt-2.5">
                                        <textarea
                                            value={myprof?.full_name ?? ""}
                                            id="myprof"
                                            name="myprof"
                                            placeholder="write your username"
                                            onChange={(e) => {
                                                setMyprof((prev) => ({
                                                    id: prev?.id || "",
                                                    avatar_url: prev?.avatar_url || "",
                                                    updated_at: prev?.updated_at || "",
                                                    full_name: e.target.value,
                                                }));
                                            }}
                                            className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600"
                                        />
                                    </div>
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-900">Avatar Image</label>
                                    <div className="mt-2.5">
                                        <input
                                            accept="image/*"
                                            multiple
                                            type="file"
                                            onChange={handleFileChange}
                                            className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={updateChange}
                                        className="mt-4 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                    >
                                        アイコンを更新
                                    </button>
                                </div>
                            </div>

                            <div className="mt-10">
                                <button
                                    type="submit"
                                    className="block w-full rounded-md bg-indigo-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                >
                                    ユーザー情報を更新
                                </button>
                            </div>
                        </form>

                        <div className="mt-10 mx-auto max-w-xl border border-gray-200 rounded-md p-6">
                            <p className="text-blue-500 text-center">{myprof?.full_name || "No Username"}</p>
                            {avatarUrl && (
                                <img
                                    src={avatarUrl}
                                    className="mx-auto mt-4 w-24 h-24 rounded-full object-cover"
                                />
                            )}
                        </div>
    </div>
        </>
    )
}