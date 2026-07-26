import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import type { Profile } from '@/types'

interface ProfilesPanelProps {
  profiles: Profile[]
  selectedProfileId?: string
  isLoading?: boolean
  onSelect: (profileId: string) => void
  onAdd: () => void
  onEdit: (profile: Profile) => void
  onDelete: (profileId: string) => void
}

export const ProfilesPanel: React.FC<ProfilesPanelProps> = ({
  profiles,
  selectedProfileId,
  isLoading,
  onSelect,
  onAdd,
  onEdit,
  onDelete,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="flex-row items-center justify-between pb-4">
        <CardTitle>Profiles</CardTitle>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button size="sm" onClick={onAdd} disabled={isLoading}>
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </motion.div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-16 bg-secondary rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center">
            <div className="h-12 w-12 rounded-lg bg-secondary/50 flex items-center justify-center mb-3">
              <User className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-3">No profiles yet</p>
            <Button size="sm" variant="outline" onClick={onAdd}>
              Create Profile
            </Button>
          </div>
        ) : (
          <motion.div
            className="space-y-2 overflow-y-auto pr-2"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <AnimatePresence>
              {profiles.map((profile) => (
                <motion.div
                  key={profile.id}
                  variants={item}
                  onHoverStart={() => setHoveredId(profile.id)}
                  onHoverEnd={() => setHoveredId(null)}
                  onClick={() => onSelect(profile.id)}
                  className={`group p-3 rounded-lg border transition-all cursor-pointer ${
                    selectedProfileId === profile.id
                      ? 'border-primary/50 bg-primary/10'
                      : 'border-border hover:border-border/50 hover:bg-secondary/50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{profile.name}</h3>
                      <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
                    </div>
                    {selectedProfileId === profile.id && (
                      <Badge variant="default" className="ml-2">
                        Active
                      </Badge>
                    )}
                  </div>

                  {hoveredId === profile.id && (
                    <motion.div
                      className="flex gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          onEdit(profile)
                        }}
                        className="h-7 px-2"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete(profile.id)
                        }}
                        className="h-7 px-2 hover:text-red-400"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
