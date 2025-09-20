import React from 'react'
import { Link } from 'react-router-dom'
import {MapPin, Clock, DollarSign, Building, Users} from 'lucide-react'

interface Job {
  _id: string
  title: string
  company: string
  location: string
  employmentType: string
  salaryMin: number
  salaryMax: number
  description: string
  skills: string[]
  experienceLevel: string
  applicationsCount: number
  createdAt: string
}

interface JobCardProps {
  job: Job
  onApply?: (jobId: string) => void
  hasApplied?: boolean
  showApplyButton?: boolean
}

const JobCard: React.FC<JobCardProps> = ({ 
  job, 
  onApply, 
  hasApplied = false, 
  showApplyButton = true 
}) => {
  const formatSalary = (min: number, max: number) => {
    const formatNumber = (num: number) => {
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
      if (num >= 1000) return `${(num / 1000).toFixed(0)}K`
      return num.toString()
    }
    return `$${formatNumber(min)} - $${formatNumber(max)}`
  }

  const getEmploymentTypeColor = (type: string) => {
    const colors = {
      'full-time': 'bg-green-100 text-green-800',
      'part-time': 'bg-blue-100 text-blue-800',
      'contract': 'bg-purple-100 text-purple-800',
      'internship': 'bg-orange-100 text-orange-800',
      'remote': 'bg-indigo-100 text-indigo-800'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getExperienceLevelColor = (level: string) => {
    const colors = {
      'entry': 'bg-green-100 text-green-800',
      'mid': 'bg-blue-100 text-blue-800',
      'senior': 'bg-purple-100 text-purple-800',
      'executive': 'bg-red-100 text-red-800'
    }
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <Link 
            to={`/jobs/${job._id}`}
            className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors"
          >
            {job.title}
          </Link>
          <div className="flex items-center text-gray-600 mt-1">
            <Building className="h-4 w-4 mr-1" />
            <span className="font-medium">{job.company}</span>
          </div>
        </div>
        
        {showApplyButton && (
          <div className="ml-4">
            {hasApplied ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                Applied
              </span>
            ) : (
              <button
                onClick={() => onApply?.(job._id)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Apply Now
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
        <div className="flex items-center">
          <MapPin className="h-4 w-4 mr-1" />
          {job.location}
        </div>
        <div className="flex items-center">
          <DollarSign className="h-4 w-4 mr-1" />
          {formatSalary(job.salaryMin, job.salaryMax)}
        </div>
        <div className="flex items-center">
          <Users className="h-4 w-4 mr-1" />
          {job.applicationsCount} applicants
        </div>
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-1" />
          {new Date(job.createdAt).toLocaleDateString()}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEmploymentTypeColor(job.employmentType)}`}>
          {job.employmentType.charAt(0).toUpperCase() + job.employmentType.slice(1)}
        </span>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getExperienceLevelColor(job.experienceLevel)}`}>
          {job.experienceLevel.charAt(0).toUpperCase() + job.experienceLevel.slice(1)} Level
        </span>
      </div>

      <p className="text-gray-700 text-sm mb-4 line-clamp-3">
        {job.description}
      </p>

      {job.skills && job.skills.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {job.skills.slice(0, 5).map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800"
            >
              {skill}
            </span>
          ))}
          {job.skills.length > 5 && (
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
              +{job.skills.length - 5} more
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default JobCard
