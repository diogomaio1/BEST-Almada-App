import * as React from 'react';
import { motion } from 'motion/react';
import { Home, Users, Briefcase, Trophy, User, Settings, Zap, Target, Shield, Menu, Info, Globe, HelpCircle, Calendar, Rocket, Award, BookOpen, MessageSquare, MoreVertical, ChevronRight, Star, Heart, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

import { UserProfile, Team, Role } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdmin?: boolean;
  user?: {
    displayName: string;
    photoURL?: string;
  } | null;
  teams?: Team[];
  opportunities?: Role[];
  helpContent?: React.ReactNode;
  glossaryContent?: React.ReactNode;
  notificationCenter?: React.ReactNode;
  renderSidebarPage: (id: string, title: string, icon: any, desc: string) => React.ReactNode;
}

export default function Layout({ 
  children, 
  activeTab, 
  setActiveTab, 
  isAdmin, 
  user, 
  teams = [], 
  opportunities = [], 
  helpContent,
  glossaryContent,
  notificationCenter,
  renderSidebarPage
}: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [openSection, setOpenSection] = React.useState<string>('comunidade');
  
  const navItems = [
    { id: 'teams', icon: Users, label: 'Equipas' },
    { id: 'events', icon: Calendar, label: 'Eventos' },
    { id: 'home', icon: Home, label: 'Início', isCenter: true },
    { id: 'opportunities', icon: Zap, label: 'Calls' },
    { id: 'metas', icon: Target, label: 'Metas' },
  ];

  return (
    <div className="h-screen flex flex-col bg-zinc-50 font-sans text-zinc-900 overflow-hidden">
      <header className="shrink-0 z-50 border-b bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-md items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger asChild nativeButton={false}>
                <div className="p-2 -ml-2 text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors cursor-pointer">
                  <Menu className="h-6 w-6" />
                </div>
              </SheetTrigger>
              <SheetContent side="left" className="w-[85%] sm:w-[350px] p-0 border-none bg-zinc-50">
                <ScrollArea className="h-full">
                  <div className="p-5 sm:p-6 space-y-6 sm:space-y-8">
                    <SheetHeader className="text-left">
                      <SheetTitle className="text-2xl font-black text-red-900">Explorar BEST</SheetTitle>
                      <SheetDescription className="text-zinc-500 font-medium">
                        Tudo o que precisas de saber sobre a nossa organização.
                      </SheetDescription>
                    </SheetHeader>

                    <div className="space-y-4">
                      {isAdmin && (
                        <section className="space-y-3 pb-3 border-b border-zinc-100">
                          <h4 className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] px-1">Administração</h4>
                          <button 
                            onClick={() => {
                              setActiveTab('admin');
                              setIsSidebarOpen(false);
                            }}
                            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-red-50 border border-red-100 text-left group transition-all hover:bg-red-100"
                          >
                            <div className="h-10 w-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0">
                              <Shield className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="text-sm font-bold text-red-900 truncate">Painel de Admin</h5>
                              <p className="text-[10px] text-red-700 font-medium truncate">Gerir membros, equipas e calls.</p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-red-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        </section>
                      )}

                      {/* Comunidade Section */}
                      <section className="space-y-2 border-b border-zinc-100 pb-3">
                        <button
                          type="button"
                          onClick={() => setOpenSection('comunidade')}
                          className="w-full flex items-center justify-between py-2 px-1 text-left focus:outline-none group"
                        >
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "h-1.5 w-1.5 rounded-full transition-all duration-300",
                              openSection === 'comunidade' ? "bg-red-600 scale-125" : "bg-transparent scale-0"
                            )} />
                            <h4 className={cn(
                              "text-xs font-black uppercase tracking-[0.2em] transition-colors",
                              openSection === 'comunidade' ? "text-red-900" : "text-zinc-400 group-hover:text-zinc-600"
                            )}>
                              Comunidade
                            </h4>
                          </div>
                          <ChevronRight className={cn(
                            "h-4 w-4 text-zinc-400 transition-all duration-300",
                            openSection === 'comunidade' ? "rotate-90 text-red-500" : "group-hover:translate-x-0.5"
                          )} />
                        </button>
                        
                        <motion.div
                          initial={false}
                          animate={{ 
                            height: openSection === 'comunidade' ? 'auto' : 0, 
                            opacity: openSection === 'comunidade' ? 1 : 0 
                          }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="grid grid-cols-2 gap-3 pt-1 pb-1">
                            <MenuSection 
                              icon={Heart} 
                              title="Famílias" 
                              desc="O programa de mentoring e as famílias do LBG."
                              onClick={() => {
                                setActiveTab('families');
                                setIsSidebarOpen(false);
                              }}
                            />
                            <MenuSection 
                              icon={Heart} 
                              title="Forms de Bem-Estar" 
                              desc="Inquéritos de bem-estar o LBG."
                              onClick={() => {
                                setActiveTab('wellness');
                                setIsSidebarOpen(false);
                              }}
                            />
                            <MenuSection 
                              icon={BookOpen} 
                              title="Glossário BEST" 
                              desc="Termos e siglas comuns no BEST."
                              content={glossaryContent}
                            />
                            <MenuSection 
                              icon={HelpCircle} 
                              title="Queres ajuda?" 
                              desc="Encontra membros por competência ou área."
                              content={helpContent}
                              className="bg-red-600 text-white border-none hover:bg-red-700 col-span-2"
                              iconClassName="bg-white/20 text-white"
                              titleClassName="text-white"
                              descClassName="text-white/70"
                              chevronClassName="text-white/40"
                            />
                          </div>
                        </motion.div>
                      </section>

                      {/* A Organização Section */}
                      <section className="space-y-2 border-b border-zinc-100 pb-3">
                        <button
                          type="button"
                          onClick={() => setOpenSection('organizacao')}
                          className="w-full flex items-center justify-between py-2 px-1 text-left focus:outline-none group"
                        >
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "h-1.5 w-1.5 rounded-full transition-all duration-300",
                              openSection === 'organizacao' ? "bg-red-600 scale-125" : "bg-transparent scale-0"
                            )} />
                            <h4 className={cn(
                              "text-xs font-black uppercase tracking-[0.2em] transition-colors",
                              openSection === 'organizacao' ? "text-red-900" : "text-zinc-400 group-hover:text-zinc-600"
                            )}>
                              A Organização
                            </h4>
                          </div>
                          <ChevronRight className={cn(
                            "h-4 w-4 text-zinc-400 transition-all duration-300",
                            openSection === 'organizacao' ? "rotate-90 text-red-500" : "group-hover:translate-x-0.5"
                          )} />
                        </button>
                        
                        <motion.div
                          initial={false}
                          animate={{ 
                            height: openSection === 'organizacao' ? 'auto' : 0, 
                            opacity: openSection === 'organizacao' ? 1 : 0 
                          }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="grid grid-cols-2 gap-3 pt-1 pb-1">
                            <MenuSection 
                              icon={Info} 
                              title="O que é o BEST?" 
                              desc="Missão, visão e propósito da organização."
                              content={renderSidebarPage('about_best', 'O que é o BEST?', Info, 'Missão, visão e propósito da organização.')}
                            />
                            <MenuSection 
                              icon={Users} 
                              title="o LBG" 
                              desc="Estrutura local, contactos e cargos principais."
                              content={renderSidebarPage('lbg_structure', 'o LBG', Users, 'Estrutura local, contactos e cargos principais.')}
                            />
                            <MenuSection 
                              icon={Shield} 
                              title="Órgãos Sociais" 
                              desc="Board, Mesa da Assembleia Geral e Conselho Fiscal."
                              content={renderSidebarPage('social_bodies', 'Órgãos Sociais', Shield, 'Board, Mesa da Assembleia Geral e Conselho Fiscal.')}
                            />
                            <MenuSection 
                              icon={Award} 
                              title="Memberships" 
                              desc="Tipos de membros e o que significam."
                              content={renderSidebarPage('memberships', 'Memberships', Award, 'Tipos de membros e o que significam.')}
                            />
                            <MenuSection 
                              icon={Globe} 
                              title="Oportunidades Internacionais" 
                              desc="Courses, events, trainings e exchanges."
                              content={renderSidebarPage('international_ops', 'Oportunidades Internacionais', Globe, 'Courses, events, trainings e exchanges.')}
                              className="col-span-2"
                            />
                          </div>
                        </motion.div>
                      </section>

                      {/* Guia do Membro Section */}
                      <section className="space-y-2 pb-3">
                        <button
                          type="button"
                          onClick={() => setOpenSection('membro')}
                          className="w-full flex items-center justify-between py-2 px-1 text-left focus:outline-none group"
                        >
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "h-1.5 w-1.5 rounded-full transition-all duration-300",
                              openSection === 'membro' ? "bg-red-600 scale-125" : "bg-transparent scale-0"
                            )} />
                            <h4 className={cn(
                              "text-xs font-black uppercase tracking-[0.2em] transition-colors",
                              openSection === 'membro' ? "text-red-900" : "text-zinc-400 group-hover:text-zinc-600"
                            )}>
                              Guia do Membro
                            </h4>
                          </div>
                          <ChevronRight className={cn(
                            "h-4 w-4 text-zinc-400 transition-all duration-300",
                            openSection === 'membro' ? "rotate-90 text-red-500" : "group-hover:translate-x-0.5"
                          )} />
                        </button>
                        
                        <motion.div
                          initial={false}
                          animate={{ 
                            height: openSection === 'membro' ? 'auto' : 0, 
                            opacity: openSection === 'membro' ? 1 : 0 
                          }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="grid grid-cols-2 gap-3 pt-1 pb-1">
                            <MenuSection 
                              icon={BookOpen} 
                              title="Guia de Onboarding" 
                              desc="Os teus primeiros passos no BEST."
                              content={renderSidebarPage('onboarding_guide', 'Guia de Onboarding', BookOpen, 'Os teus primeiros passos no BEST.')}
                            />
                            <MenuSection 
                              icon={HelpCircle} 
                              title="FAQ Interna" 
                              desc="Dúvidas frequentes sobre o LBG."
                              content={renderSidebarPage('internal_faq', 'FAQ Interna', HelpCircle, 'Dúvidas frequentes sobre o LBG.')}
                            />
                          </div>
                        </motion.div>
                      </section>
                    </div>

                    <div className="pt-4 pb-8">
                      <p className="text-[10px] text-zinc-400 text-center font-medium">BEST Almada Hub v1.0</p>
                    </div>
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>
            <span className="text-lg font-black tracking-tight text-red-900">BEST Almada</span>
          </div>
          
          <div className="flex items-center gap-2">
            {notificationCenter}
            <button 
              onClick={() => setActiveTab('profile')}
              className={cn(
              "relative h-10 w-10 rounded-full border-2 transition-all",
              activeTab === 'profile' ? "border-red-600 scale-110" : "border-transparent"
            )}
          >
            <Avatar className="h-full w-full">
              <AvatarImage src={user?.photoURL} />
              <AvatarFallback>{user?.displayName?.charAt(0) || '?'}</AvatarFallback>
            </Avatar>
          </button>
        </div>
      </div>
    </header>

      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="mx-auto max-w-2xl px-4 py-6 pb-32">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </div>
      </main>

      <nav className="shrink-0 border-t bg-white pb-safe shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)]">
        <div className="mx-auto grid grid-cols-5 max-w-md items-end px-1 py-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 transition-all relative pb-1",
                item.isCenter ? "z-10" : "",
                activeTab === item.id ? "text-red-600" : "text-zinc-400 hover:text-zinc-600"
              )}
            >
              <div className={cn(
                "flex flex-col items-center justify-center transition-all duration-300",
                item.isCenter ? "h-14 w-14 bg-red-600 text-white rounded-2xl shadow-lg shadow-red-200 -mb-6 border-4 border-white" : "h-10"
              )}>
                <item.icon className={cn(item.isCenter ? "h-7 w-7" : "h-5 w-5")} />
              </div>
              <span className={cn(
                "text-[9px] font-bold uppercase tracking-tighter transition-all",
                item.isCenter ? "mt-6 text-red-600" : "",
                activeTab === item.id ? "opacity-100" : "opacity-60"
              )}>
                {item.label}
              </span>
              {activeTab === item.id && !item.isCenter && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -bottom-1 h-1 w-1 rounded-full bg-red-600"
                />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

// --- Menu Components ---

interface MenuSectionProps {
  icon: any;
  title: string;
  desc: string;
  onClick?: () => void;
  content?: React.ReactNode;
  className?: string;
  iconClassName?: string;
  titleClassName?: string;
  descClassName?: string;
  chevronClassName?: string;
}

function MenuSection({ 
  icon: Icon, 
  title, 
  desc, 
  onClick, 
  content,
  className,
  iconClassName,
  titleClassName,
  descClassName,
  chevronClassName
}: MenuSectionProps) {
  const Trigger = (
    <button 
      type="button"
      onClick={content ? undefined : onClick}
      className={cn(
        "w-full flex flex-col gap-3 p-4 sm:p-5 rounded-2xl bg-white border border-zinc-100 hover:border-red-200 hover:bg-red-50/30 transition-all text-left group cursor-pointer h-full justify-between shadow-xs hover:shadow-md",
        className
      )}
    >
      <div className="flex flex-col gap-3 flex-1 min-w-0 w-full">
        <div className={cn(
          "h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-zinc-50 text-zinc-400 flex items-center justify-center group-hover:bg-red-100 group-hover:text-red-600 transition-colors shrink-0",
          iconClassName
        )}>
          <Icon className="h-5 w-5 sm:h-5.5 sm:w-5.5" />
        </div>
        <div className="flex-1 min-w-0">
          <h5 className={cn(
            "text-sm sm:text-base font-bold text-zinc-900 leading-snug group-hover:text-red-700 transition-colors line-clamp-1",
            titleClassName
          )}>{title}</h5>
          <p className={cn(
            "text-[10px] sm:text-[12px] text-zinc-400 font-semibold leading-relaxed mt-1 group-hover:text-red-600/60 transition-colors line-clamp-3",
            descClassName
          )}>{desc}</p>
        </div>
      </div>
      <div className="flex justify-end w-full mt-1 sm:hidden">
        <ChevronRight className={cn(
          "h-3.5 w-3.5 text-zinc-300 group-hover:text-red-400 group-hover:translate-x-0.5 transition-all shrink-0",
          chevronClassName
        )} />
      </div>
      <ChevronRight className={cn(
        "hidden sm:block h-4 w-4 text-zinc-300 group-hover:text-red-400 group-hover:translate-x-0.5 transition-all shrink-0 self-end mt-2",
        chevronClassName
      )} />
    </button>
  );

  if (content) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          {Trigger}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px] rounded-[2rem] max-h-[85vh] overflow-y-auto p-0 border-none shadow-2xl">
          <div className="p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-100">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black text-red-900 uppercase tracking-tight">{title}</DialogTitle>
                <DialogDescription className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em]">{desc}</DialogDescription>
              </div>
            </div>
            <div className="pt-4">
              {content}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return Trigger;
}

function FaqInfo() {
  return null;
}
