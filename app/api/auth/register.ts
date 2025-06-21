import type { NextApiRequest,NextApiResponse } from "next";
import { supabase } from "@/utils/supabase/supabase";

export default async function handler(req:NextApiRequest,res:NextApiResponse){
    const {email,password,role} =  req.body
    if(!/\S+@\S+\.\S+/.test(email)) return res.status(400).json({error:"使用できるものは英数字・記号のみです。"})
        if(typeof password! =="string"||password.length<8) res.status(400).json({error:"パスワードは8文字以上で入力してください。"})
            if (!["admin", "customer"].includes(role)) {
    return res.status(400).json({ error: "無効なユーザー種別です。" });
  }
            const {data,error:signUpError} = await supabase.auth.signUp({email,password})
            if(signUpError) return res.status(400).json({error: signUpError.message})
                //プロファイルにロールを追加

            const userId = data.user?.id;
            if (!userId){
                res.status(500).json({error:"ユーザー登録に失敗しました。"})
            }

            const {error:profileError} = await supabase
            .from('users')
            .insert({id:data.user?.id,role})
            .single()
            if(profileError){
                res.status(401).json({ error: "プロファイル作成に失敗しました。" })
            }
            res.status(201).json({message:"ユーザー登録完了"})


}