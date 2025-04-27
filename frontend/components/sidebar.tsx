"use client"

import { useState, useRef, useEffect } from "react"
import Link from 'next/link'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Briefcase, Calendar, Users, HelpCircle, FileText, X, MessageSquare, Plus, Download, MoreVertical, LogOut, Menu, Sun, Moon, User, MapPin, Settings } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { FAQMenu } from './FAQMenu'
import SchedulingModal from "./scheduling-modal"
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface SidebarProps {
  previousChats: { id: string; title: string; date: string }[]
  onSelectChat: (id: string) => void
  onNewChat: () => void
  onClose: () => void
  onDeleteChat: (id: string) => void
  onLogout: () => void
}

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  role: string;
  company?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  experience?: number;
}

export default function Sidebar({ 
  previousChats, 
  onSelectChat, 
  onNewChat, 
  onClose,
  onDeleteChat,
  onLogout 
}: SidebarProps) {
  const [activeSection, setActiveSection] = useState<string>("chats")
  const [hoveredChat, setHoveredChat] = useState<string | null>(null)
  const [schedulingStates, setSchedulingStates] = useState<Record<string, boolean>>({})
  const [mentors, setMentors] = useState([
    { name: "John Smith", role: "Senior Developer", years: 10 },
    { name: "Sarah Johnson", role: "Product Manager", years: 8 },
    { name: "Michael Chen", role: "UX Designer", years: 5 },
    { name: "Priya Patel", role: "Data Scientist", years: 7 }
  ])
  const [showAddMentorModal, setShowAddMentorModal] = useState(false)
  const [newMentor, setNewMentor] = useState({ name: "", role: "", years: 0 })
  const [showSchedulingModal, setShowSchedulingModal] = useState(false)
  const [selectedMentor, setSelectedMentor] = useState<string | null>(null)
  const mentorsRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "",
    email: "",
    avatar: "/avatars/default.png",
    role: "",
    company: "",
    location: "",
    bio: "",
    skills: [],
    experience: 0
  })

  // Profile modals state
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showSessions, setShowSessions] = useState(false)
  const [showAccountSettings, setShowAccountSettings] = useState(false)
  const [editProfileData, setEditProfileData] = useState<UserProfile | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [editProfileSuccess, setEditProfileSuccess] = useState(false)
  const [editProfileError, setEditProfileError] = useState("")

  const sections = [
    { id: "chats", label: "Previous Chats", icon: <MessageSquare className="h-5 w-5" /> },
    { id: "events", label: "Events", icon: <Calendar className="h-5 w-5" /> },
    { id: "mentorship", label: "Mentorship", icon: <Users className="h-5 w-5" /> },
    { id: "faqs", label: "FAQs", icon: <HelpCircle className="h-5 w-5" /> },
    { id: "resources", label: "Resources", icon: <FileText className="h-5 w-5" /> },
  ]

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const parsedUserData = JSON.parse(userData)
        setUserProfile(prev => ({
          ...prev,
          name: parsedUserData.name || "",
          email: parsedUserData.email || "",
          role: parsedUserData.role || "",
          company: parsedUserData.company || "",
          location: parsedUserData.location || "",
          bio: parsedUserData.bio || "",
          skills: parsedUserData.skills || [],
          experience: parsedUserData.experience || 0
        }))
      } catch (error) {
        console.error("Error parsing user data:", error)
      }
    }
  }, [])

  const handleSchedulingOpen = (mentorName: string) => {
    setSelectedMentor(mentorName)
    setShowSchedulingModal(true)
  }

  const handleSchedulingClose = () => {
    setShowSchedulingModal(false)
    setSelectedMentor(null)
  }

  const handleLogout = () => {
    onLogout()
    router.push('/auth')
  }

  const handleAddMentor = () => {
    if (newMentor.name && newMentor.role && newMentor.years > 0) {
      setMentors([...mentors, newMentor])
      setNewMentor({ name: "", role: "", years: 0 })
      setShowAddMentorModal(false)
      // Scroll to bottom after adding new mentor
      setTimeout(() => {
        if (mentorsRef.current) {
          mentorsRef.current.scrollTop = mentorsRef.current.scrollHeight
        }
      }, 100)
    }
  }

  // Handlers for menu
  const handleEditProfile = () => {
    setEditProfileData(userProfile)
    setShowEditProfile(true)
  }
  const handleSessions = () => setShowSessions(true)
  const handleAccountSettings = () => setShowAccountSettings(true)

  // Save profile changes
  const handleSaveProfile = () => {
    if (editProfileData) {
      // Basic validation
      if (!editProfileData.name.trim() || !editProfileData.email.trim()) {
        setEditProfileError("Name and Email are required.")
        return
      }
      setUserProfile(editProfileData)
      localStorage.setItem('user', JSON.stringify(editProfileData))
      setEditProfileSuccess(true)
      setEditProfileError("")
      setTimeout(() => {
        setShowEditProfile(false)
        setEditProfileSuccess(false)
      }, 2000)
    }
  }

  // Handle profile photo upload
  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setEditProfileData(prev => prev ? { ...prev, avatar: ev.target?.result as string } : null)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="h-full w-full bg-black/50 backdrop-blur-sm border-r border-white/10 shadow-xl overflow-hidden">
      <div className="p-4 h-full flex flex-col">
        <div className="flex justify-between items-center mb-6 mt-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2"
          >
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white hover:bg-white/5"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-white/5"
              onClick={onClose}
            >
              <Menu className="h-4 w-4 mr-2" />
              Menu
            </Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2"
          >
            <DropdownMenu open={showProfileMenu} onOpenChange={setShowProfileMenu}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-white/5 hover:bg-white/10"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
                    <AvatarFallback className="bg-white/10 text-white">
                      {userProfile.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-72 bg-black/80 backdrop-blur-sm border-white/10"
              >
                <div className="p-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-16 w-16 cursor-pointer" onClick={handleEditProfile}>
                      <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
                      <AvatarFallback className="bg-white/10 text-white text-lg">
                        {userProfile.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-lg font-medium text-white">{userProfile.name}</span>
                      <span className="text-sm text-gray-400">{userProfile.email}</span>
                      <span className="text-sm text-gray-300">{userProfile.role}</span>
                    </div>
                  </div>

                  {userProfile.company && (
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Briefcase className="h-4 w-4" />
                      <span>{userProfile.company}</span>
                    </div>
                  )}

                  {userProfile.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <MapPin className="h-4 w-4" />
                      <span>{userProfile.location}</span>
                    </div>
                  )}

                  {(userProfile.experience ?? 0) > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Calendar className="h-4 w-4" />
                      <span>{(userProfile.experience ?? 0)} years of experience</span>
                    </div>
                  )}

                  {userProfile.bio && (
                    <div className="text-sm text-gray-400">
                      <p>{userProfile.bio}</p>
                    </div>
                  )}

                  {userProfile.skills && userProfile.skills.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-white">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {userProfile.skills.map((skill, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 text-xs rounded-full bg-white/5 text-gray-300"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <DropdownMenuSeparator className="bg-white/10" />
                
                <div className="p-2">
                  <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-white/5 focus:text-white focus:bg-white/5" onClick={handleEditProfile}>
                    <User className="h-4 w-4 mr-2" />
                    Edit Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-white/5 focus:text-white focus:bg-white/5" onClick={handleSessions}>
                    <Briefcase className="h-4 w-4 mr-2" />
                    My Sessions
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-white/5 focus:text-white focus:bg-white/5" onClick={handleAccountSettings}>
                    <Settings className="h-4 w-4 mr-2" />
                    Account Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem 
                    className="text-red-500 hover:text-red-500 hover:bg-red-500/10 focus:text-red-500 focus:bg-red-500/10"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="md:hidden text-gray-400 hover:text-white hover:bg-white/5 rounded-full h-8 w-8"
            >
              <X className="h-5 w-5" />
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Button
            variant="outline"
            className="w-full mb-6 bg-white/5 border-white/10 text-white hover:bg-white/10 transition-all duration-300 group"
            onClick={onNewChat}
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            New Chat
          </Button>
        </motion.div>

        {/* Section tabs */}
        <motion.div
          className="flex flex-wrap gap-2 mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
            >
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "flex items-center gap-1 px-2 py-1 text-xs transition-all duration-300",
                  activeSection === section.id
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:text-white hover:bg-white/5",
                )}
                onClick={() => setActiveSection(section.id)}
              >
                {section.icon}
                <span className="sr-only md:not-sr-only">{section.label}</span>
              </Button>
            </motion.div>
          ))}
        </motion.div>

        {/* Section content with animated transitions */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeSection === "chats" && (
              <motion.div
                key="chats"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-2"
              >
                {previousChats.length > 0 ? (
                  previousChats.map((chat, index) => (
                    <motion.div
                      key={chat.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      onMouseEnter={() => setHoveredChat(chat.id)}
                      onMouseLeave={() => setHoveredChat(null)}
                      className="relative group"
                    >
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start text-left text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-300 pr-10",
                          hoveredChat === chat.id && "bg-white/5",
                        )}
                        onClick={() => onSelectChat(chat.id)}
                      >
                        <div className="truncate">
                          <div className="font-medium truncate flex items-center">
                            <MessageSquare className="h-3 w-3 mr-2 opacity-70" />
                            {chat.title}
                          </div>
                          <div className="text-xs text-gray-500">{chat.date}</div>
                        </div>
                      </Button>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/5"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 bg-black/80 backdrop-blur-sm border-white/10">
                            <DropdownMenuItem
                              className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteChat(chat.id);
                              }}
                            >
                              Delete chat
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.p
                    className="text-sm text-gray-500 p-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    No previous chats
                  </motion.p>
                )}
              </motion.div>
            )}

            {activeSection === "events" && (
              <motion.div
                key="events"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
                className="p-2 space-y-3"
              >
                {["Career Fair", "Resume Workshop", "Interview Masterclass", "Networking Event"].map((event, index) => (
                  <motion.div
                    key={event}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-white/5 p-3 rounded-lg border border-white/5 hover:border-white/10 transition-all duration-300 cursor-pointer hover:bg-white/10"
                  >
                    <h3 className="font-medium text-white">{event}</h3>
                    <p className="text-xs text-gray-300">
                      May {15 + index}, 2023 • {["Virtual", "Online", "Hybrid", "In-person"][index]}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {activeSection === "mentorship" && (
              <motion.div
                key="mentorship"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
                className="p-2 space-y-3"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium text-white">Available Mentors</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white hover:bg-white/5"
                    onClick={() => setShowAddMentorModal(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Mentor
                  </Button>
                </div>
                <div 
                  ref={mentorsRef}
                  className="max-h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar"
                >
                  {mentors.map((mentor, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="bg-white/5 p-3 rounded-lg border border-white/5 hover:border-white/10 transition-all duration-300 mb-2"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-white">{mentor.name}</h3>
                          <p className="text-xs text-gray-300">
                            {mentor.role} • {mentor.years}+ years
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white hover:bg-white/5"
                          onClick={() => handleSchedulingOpen(mentor.name)}
                        >
                          Schedule session
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Add Mentor Modal */}
                {showAddMentorModal && (
                  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="bg-black/80 p-6 rounded-lg border border-white/10 w-full max-w-md"
                    >
                      <h3 className="text-lg font-medium text-white mb-4">Add New Mentor</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm text-gray-300">Name</label>
                          <input
                            type="text"
                            value={newMentor.name}
                            onChange={(e) => setNewMentor({ ...newMentor, name: e.target.value })}
                            className="w-full mt-1 bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                            placeholder="Enter mentor name"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-300">Role</label>
                          <input
                            type="text"
                            value={newMentor.role}
                            onChange={(e) => setNewMentor({ ...newMentor, role: e.target.value })}
                            className="w-full mt-1 bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                            placeholder="Enter mentor role"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-300">Years of Experience</label>
                          <input
                            type="number"
                            value={newMentor.years}
                            onChange={(e) => setNewMentor({ ...newMentor, years: parseInt(e.target.value) || 0 })}
                            className="w-full mt-1 bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                            placeholder="Enter years of experience"
                            min="0"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-6">
                        <Button
                          variant="ghost"
                          className="text-gray-400 hover:text-white"
                          onClick={() => setShowAddMentorModal(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="outline"
                          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                          onClick={handleAddMentor}
                        >
                          Add Mentor
                        </Button>
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* Scheduling Modal */}
                {showSchedulingModal && selectedMentor && (
                  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="bg-black/80 p-6 rounded-lg border border-white/10 w-full max-w-md"
                    >
                      <h3 className="text-lg font-medium text-white mb-4">Schedule Session with {selectedMentor}</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm text-gray-300">Date</label>
                          <input
                            type="date"
                            className="w-full mt-1 bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-300">Time</label>
                          <input
                            type="time"
                            className="w-full mt-1 bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-300">Notes (Optional)</label>
                          <textarea
                            className="w-full mt-1 bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                            rows={3}
                            placeholder="Add any notes for the session"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-6">
                        <Button
                          variant="ghost"
                          className="text-gray-400 hover:text-white"
                          onClick={handleSchedulingClose}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="outline"
                          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                          onClick={() => {
                            // Handle scheduling logic here
                            handleSchedulingClose()
                          }}
                        >
                          Schedule
                        </Button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            )}

            {activeSection === "faqs" && (
              <motion.div
                key="faqs"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
                className="p-2"
              >
                <FAQMenu />
              </motion.div>
            )}

            {activeSection === "resources" && (
              <motion.div
                key="resources"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
                className="p-2 space-y-3"
              >
                {[
                  { name: "Resume Templates", file: "resume_templates.pdf" },
                  { name: "Interview Preparation Guide", file: "interview_guide.pdf" },
                  { name: "Salary Negotiation Tips", file: "salary_tips.pdf" },
                  { name: "Career Path Guides", file: "career_guides.pdf" },
                  { name: "Industry Insights", file: "industry_insights.pdf" },
                ].map((resource, index) => (
                  <motion.a
                    key={resource.name}
                    href={`/resources/${resource.file}`}
                    download={resource.file}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/5 hover:border-white/10 transition-all duration-300 cursor-pointer hover:bg-white/10 text-white"
                  >
                    <span className="font-medium">{resource.name}</span>
                    <Download className="h-4 w-4 text-gray-400" />
                  </motion.a>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditProfile && editProfileData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-black/90 p-6 rounded-lg border border-white/10 w-full max-w-lg max-h-[90vh] flex flex-col">
            <h3 className="text-lg font-medium text-white mb-4">Edit Profile</h3>
            {editProfileSuccess && (
              <div className="mb-4 p-2 bg-green-600/20 text-green-400 rounded text-center">Profile updated successfully!</div>
            )}
            {editProfileError && (
              <div className="mb-4 p-2 bg-red-600/20 text-red-400 rounded text-center">{editProfileError}</div>
            )}
            <div className="flex-1 flex flex-col items-center gap-4 mb-4 overflow-y-auto w-full pr-2" style={{ minHeight: 0 }}>
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={editProfileData.avatar} alt={editProfileData.name} />
                  <AvatarFallback className="bg-white/10 text-white text-lg">
                    {editProfileData.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <button
                  className="absolute bottom-0 right-0 bg-white/20 rounded-full p-1 hover:bg-white/40"
                  onClick={() => fileInputRef.current?.click()}
                  title="Change photo"
                >
                  <Plus className="h-4 w-4 text-white" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfilePhotoChange}
                />
              </div>
              <input type="text" className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white" placeholder="Name" value={editProfileData.name} onChange={e => setEditProfileData({ ...editProfileData, name: e.target.value })} />
              <input type="email" className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white" placeholder="Email" value={editProfileData.email} onChange={e => setEditProfileData({ ...editProfileData, email: e.target.value })} />
              <input type="text" className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white" placeholder="Role" value={editProfileData.role} onChange={e => setEditProfileData({ ...editProfileData, role: e.target.value })} />
              <input type="text" className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white" placeholder="Company" value={editProfileData.company} onChange={e => setEditProfileData({ ...editProfileData, company: e.target.value })} />
              <input type="text" className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white" placeholder="Location" value={editProfileData.location} onChange={e => setEditProfileData({ ...editProfileData, location: e.target.value })} />
              <textarea className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white" placeholder="Bio" value={editProfileData.bio} onChange={e => setEditProfileData({ ...editProfileData, bio: e.target.value })} />
              <input type="number" className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white" placeholder="Experience (years)" value={editProfileData.experience} onChange={e => setEditProfileData({ ...editProfileData, experience: Number(e.target.value) })} min={0} />
              <input type="text" className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white" placeholder="Skills (comma separated)" value={editProfileData.skills?.join(', ') || ''} onChange={e => setEditProfileData({ ...editProfileData, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <Button variant="ghost" className="text-gray-400 hover:text-white" onClick={() => setShowEditProfile(false)}>Cancel</Button>
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={handleSaveProfile}>Save</Button>
            </div>
          </motion.div>
        </div>
      )}
      {/* My Sessions Modal */}
      {showSessions && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-black/90 p-6 rounded-lg border border-white/10 w-full max-w-md">
            <h3 className="text-lg font-medium text-white mb-4">My Sessions</h3>
            <div className="text-gray-300">(Session details go here...)</div>
            <div className="flex justify-end mt-4">
              <Button variant="ghost" className="text-gray-400 hover:text-white" onClick={() => setShowSessions(false)}>Close</Button>
            </div>
          </motion.div>
        </div>
      )}
      {/* Account Settings Modal */}
      {showAccountSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-black/90 p-6 rounded-lg border border-white/10 w-full max-w-md">
            <h3 className="text-lg font-medium text-white mb-4">Account Settings</h3>
            <div className="text-gray-300">(Account settings go here...)</div>
            <div className="flex justify-end mt-4">
              <Button variant="ghost" className="text-gray-400 hover:text-white" onClick={() => setShowAccountSettings(false)}>Close</Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
