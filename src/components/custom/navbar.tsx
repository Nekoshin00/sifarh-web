import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button"


export default function Navbar() {
    return (

        <nav className="bg-white fixed w-full z-20 top-0 inset-s-0 border-b border-default">
            <div className="max-w-7xl flex flex-wrap items-center justify-between mx-auto p-2">

                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <img src="/favicon.ico" className="h-7" alt="React Logo" />
                    <span className="self-center text-xl text-heading font-semibold whitespace-nowrap">SIFARH</span>
                </div>

                <Drawer swipeDirection={"right"}>
                    <DrawerTrigger render={<Button variant="outline" className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm md:hidden" />}>
                        <span className="sr-only">Open main menu</span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    </DrawerTrigger>
                    <DrawerContent>
                        <DrawerHeader>
                            <DrawerTitle>Are you absolutely sure?</DrawerTitle>
                            <DrawerDescription>This action cannot be undone.</DrawerDescription>
                        </DrawerHeader>
                        <div className="p-4">
                            <ul className="font-medium flex flex-col p-4">
                                <li className="block py-2 px-3 bg-brand rounded-md">Menu Item 1</li>
                                <li className="block py-2 px-3 bg-brand rounded-md">Menu Item 2</li>
                                <li className="block py-2 px-3 bg-brand rounded-md">Menu Item 3</li>
                            </ul>
                        </div>
                    </DrawerContent>
                </Drawer>

                <NavigationMenu className="hidden md:flex">
                    <NavigationMenuList>
                        <NavigationMenuItem>
                            <NavigationMenuLink className="px-3 py-2 rounded-md text-md" render={<a href="/">Home</a>}/>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <NavigationMenuLink className="px-3 py-2 rounded-md text-md" render={<a href="/about">About</a>}/>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <NavigationMenuLink className="px-3 py-2 rounded-md text-md" render={<a href="/shopping">Buy</a>}/>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <NavigationMenuLink className="px-3 py-2 rounded-md text-md" render={<a href="/contact">Contact</a>}/>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>

            </div>
        </nav>
    );
}