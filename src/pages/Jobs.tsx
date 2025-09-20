import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useJobPortal } from '../hooks/useJobPortal';
import JobCard from '../components/JobCard';
import JobFilters from '../components/JobFilters';
import {Briefcase} from 'lucide-react';

interface FilterState {
  search: string
  location: string
  category: string
  employmentType: string
  experienceLevel: string
  salaryMin: string
}

const Jobs: React.FC = () => {
  const { user, isAuthenticated, signIn } = useAuth()
  const { jobs, loading, applyForJob, hasUserApplied, fetchUserApplications } = useJobPortal()
  const [filteredJobs, setFilteredJobs] = useState(jobs)
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    expectedSalary: ''
  })

  // Filter jobs based on filter criteria
  const applyFilters = useCallback((filters: FilterState) => {
    let filtered = jobs

    if (filters.search) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.company.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.skills?.some(skill => skill.toLowerCase().includes(filters.search.toLowerCase()))
      )
    }

    if (filters.location) {
      filtered = filtered.filter(job => 
        job.location.toLowerCase().includes(filters.location.toLowerCase())
      )
    }

    if (filters.category) {
      filtered = filtered.filter(job => job.category === filters.category)
    }

    if (filters.employmentType) {
      filtered = filtered.filter(job => job.employmentType === filters.employmentType)
    }

    if (filters.experienceLevel) {
      filtered = filtered.filter(job => job.experienceLevel === filters.experienceLevel)
    }

    if (filters.salaryMin) {
      const minSalary = parseInt(filters.salaryMin)
      filtered = filtered.filter(job => job.salaryMin >= minSalary)
    }

    setFilteredJobs(filtered)
  }, [jobs])

  // Handle job application
  const handleApply = (jobId: string) => {
    if (!isAuthenticated) {
      signIn()
      return
    }

    setSelectedJobId(jobId)
    setShowApplicationModal(true)
  }

  // Submit application
  const submitApplication = async () => {
    if (!selectedJobId || !user) return

    try {
      await applyForJob(selectedJobId, {
        coverLetter: applicationData.coverLetter,
        expectedSalary: parseFloat(applicationData.expectedSalary),
        applicantId: user.userId
      })
      
      setShowApplicationModal(false)
      setApplicationData({ coverLetter: '', expectedSalary: '' })
      setSelectedJobId(null)
    } catch (error) {
      console.error('Failed to submit application:', error)
    }
  }

  useEffect(() => {
    setFilteredJobs(jobs)
  }, [jobs])

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserApplications(user.userId)
    }
  }, [isAuthenticated, user, fetchUserApplications])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Briefcase className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Find Your Next Job</h1>
          </div>
          <p className="text-gray-600">
            Discover {jobs.length} amazing job opportunities from top companies
          </p>
        </div>

        {/* Filters */}
        <JobFilters onFiltersChange={applyFilters} />

        {/* Results */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredJobs.length} of {jobs.length} jobs
          </p>
        </div>

        {/* Jobs Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredJobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                onApply={handleApply}
                hasApplied={isAuthenticated && user ? hasUserApplied(job._id, user.userId) : false}
                showApplyButton={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* Application Modal */}
      {showApplicationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Apply for Job</h2>
              
              <form onSubmit={(e) => { e.preventDefault(); submitApplication(); }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cover Letter *
                    </label>
                    <textarea
                      value={applicationData.coverLetter}
                      onChange={(e) => setApplicationData(prev => ({ ...prev, coverLetter: e.target.value }))}
                      placeholder="Tell us why you're the perfect fit for this role..."
                      required
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expected Salary (Annual) *
                    </label>
                    <input
                      type="number"
                      value={applicationData.expectedSalary}
                      onChange={(e) => setApplicationData(prev => ({ ...prev, expectedSalary: e.target.value }))}
                      placeholder="75000"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex gap-4 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
                  >
                    Submit Application
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowApplicationModal(false)
                      setApplicationData({ coverLetter: '', expectedSalary: '' })
                      setSelectedJobId(null)
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Jobs
