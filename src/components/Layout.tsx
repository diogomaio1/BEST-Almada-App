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
              <SheetContent side="left" className="w-[85%] sm:w-[350px] p-0 border-none">
                <ScrollArea className="h-full bg-zinc-50">
                  <div className="p-6 space-y-8">
                    <SheetHeader className="text-left">
                      <SheetTitle className="text-2xl font-black text-red-900">Explorar BEST</SheetTitle>
                      <SheetDescription className="text-zinc-500 font-medium">
                        Tudo o que precisas de saber sobre a nossa organização.
                      </SheetDescription>
                    </SheetHeader>

                    <div className="space-y-6">
                      {isAdmin && (
                        <section className="space-y-3">
                          <h4 className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em]">Administração</h4>
                          <button 
                            onClick={() => setActiveTab('admin')}
                            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-red-50 border border-red-100 text-left group transition-all hover:bg-red-100"
                          >
                            <div className="h-10 w-10 rounded-xl bg-red-600 text-white flex items-center justify-center">
                              <Shield className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <h5 className="text-sm font-bold text-red-900">Painel de Admin</h5>
                              <p className="text-[10px] text-red-700 font-medium">Gerir membros, equipas e calls.</p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-red-400" />
                          </button>
                        </section>
                      )}

                      <section className="space-y-3">
                        <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Comunidade</h4>
                        <div className="grid gap-2">
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
                            className="bg-red-600 text-white border-none hover:bg-red-700"
                            iconClassName="bg-white/20 text-white"
                            titleClassName="text-white"
                            descClassName="text-white/70"
                            chevronClassName="text-white/40"
                          />
                        </div>
                      </section>

                      <section className="space-y-3">
                        <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">A Organização</h4>
                        <div className="grid gap-2">
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
                          />
                        </div>
                      </section>

                      <section className="space-y-3">
                        <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Guia do Membro</h4>
                        <div className="grid gap-2">
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
        "w-full flex items-center gap-4 p-4 rounded-2xl bg-white border border-zinc-100 hover:border-red-200 hover:bg-red-50/30 transition-all text-left group cursor-pointer",
        className
      )}
    >
      <div className={cn(
        "h-10 w-10 rounded-xl bg-zinc-50 text-zinc-400 flex items-center justify-center group-hover:bg-red-100 group-hover:text-red-600 transition-colors",
        iconClassName
      )}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h5 className={cn(
          "text-base font-bold text-zinc-900 truncate group-hover:text-red-700 transition-colors",
          titleClassName
        )}>{title}</h5>
        <p className={cn(
          "text-[11px] text-zinc-400 font-semibold truncate group-hover:text-red-600/60 transition-colors",
          descClassName
        )}>{desc}</p>
      </div>
      <ChevronRight className={cn(
        "h-4 w-4 text-zinc-300 group-hover:text-red-400 group-hover:translate-x-0.5 transition-all",
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
