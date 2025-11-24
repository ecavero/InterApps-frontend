import {useEffect, useState} from "react"
import {social} from '../data/social'
import DevTreeInput from "../components/DevTreeInput";
import { isValidUrl } from "../utils";
import { toast } from "sonner";
import { useMutation,useQueryClient } from "@tanstack/react-query";
import { updateProfile } from "../api/DevTreeAPI";
import type { SocialNetwork, User } from "../types";

export default function LinkTreeView(){
    const [devTreeLinks, setDevTreeLinks] = useState(social);

    const queryClient = useQueryClient()
    const user : User = queryClient.getQueryData(['user'])!

    console.log(JSON.parse(user.links))

    const{mutate} = useMutation({
        mutationFn: updateProfile,
        onError: (error) => {
            toast.error(error.message)
        },
        onSuccess: () => {
            toast.success("Profile updated successfully")
        }
    })

    useEffect(() => {
        // console.log(devTreeLinks)
        // console.log(JSON.parse(user.links))
        const updatedData = devTreeLinks.map(item => {
            const userlink = JSON.parse(user.links).find((link: SocialNetwork) => link.name === item.name)
            if(user.links){
                return {...item, url: userlink, enabled: userlink.enabled}
            }
            return item
        })
        setDevTreeLinks(updatedData)
    }, [])

    const handleUrlChange = (e : React.ChangeEvent<HTMLInputElement>) => {

        //matea cada elemento del estado actual 
        //si el nombre del alcance coincide con el del input que genero el evento,
        //actualiza la url con el valor del input
        const updatedLinks = devTreeLinks.map(link => link.name === e.target.name ? {...link, url: e.target.value} : link)

        //console.log(updatedLinks)

        //actualiza el estado con la nueva lista de enlaces
        setDevTreeLinks(updatedLinks)

        /*
        queryClient.setQueryData(['user'], (prevData: User)=> {
            return {
                ...prevData,
                limks: JSON.stringify(updatedLinks)
            }
        })
        */

    }

    const links: SocialNetwork[] = JSON.parse(user.links)
    
    const handleEnableLink = (socialNetwork: string) => {
        //console.log(socialNetwork)
        //const updatedLinks = devTreeLinks.map(link => link.name === socialNetwork ? {...link, enabled: !link.enabled} : link)
        const updatedLinks = devTreeLinks.map(link => {
            if(link.name === socialNetwork){
                if(isValidUrl(link.url)){
                    return {...link, enabled: !link.enabled}
                }else{
                    toast.error("URL no valida")   
                }
            }
            return link
        })

        //console.log(updatedLinks)
        setDevTreeLinks(updatedLinks)

        let updateItems: SocialNetwork[] = []

        const selectedSocialNetwork = updatedLinks.find(link => link.name == socialNetwork)
        if(selectedSocialNetwork?.enabled){
            const id = links.filter(link => link.id).length + 1

            if(links.some(link => link.name === socialNetwork)){
                updateItems = links.map(link =>{
                    if(link.name===socialNetwork){
                        return {
                            ...link,
                            enabled: true,
                            id
                        }
                    }else{
                        return link
                    }
                })
            }else {
                const newItem={
                    ...selectedSocialNetwork,
                    id
                }
                updateItems = [...links, newItem]
            }
        
        } else{
            const indexToUpdate = links.findIndex(link => link.name == socialNetwork)
            updateItems= links.map(link => {
                if(link.name == socialNetwork){
                    return {
                        ...link,
                        id: 0,
                        enabled: false
                    }
                } else if (link.id > indexToUpdate && (indexToUpdate!==0 && link.id ===1)){
                    return {
                        ...link,
                        id: link.id -1
                    }
                } else {
                    return link
                }
            })
        }

        queryClient.setQueryData(['user'], (prevData: User) => {
            return {
                ...prevData,
                links: JSON.stringify(updateItems) //etos links son un arreglo, por eso los convertimos a string
            }
        })
        
    }

    return(
        <div className="space y-5">
            {devTreeLinks.map(item=>(
                <DevTreeInput 
                key={item.name}
                //pasamos el item hacia el componente
                item={item}
                handleUrlChange={handleUrlChange}
                handleEnableLink={handleEnableLink}
                />
            ))}
            <button
                className="bg-cyan-400 p-2 text-lg w-full uppercase text-slate-600 rounded-lg font-bold" 
                onClick={()=>mutate(queryClient.getQueryData(['user'])!)}
            >Guardar Cambios</button>
        </div>
    )
}