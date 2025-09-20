import { useState, useEffect, useCallback } from 'react';
import { lumi } from '../lib/lumi';
import toast from 'react-hot-toast';

interface Job {
  _id: string
  title: string
  company: string
  location: string
  employmentType: string
  salaryMin: number
  salaryMax: number
  description: string
  requirements: string[]
  skills: string[]
  category: string
  experienceLevel: string
  status: string
  applicationDeadline: string
  postedBy: string
  applicationsCount: number
  createdAt: string
}

interface Company {
  _id: string
  name: string
  industry: string
  size: string
  location: string
  description: string
  website?: string
  logo?: string
  verified: boolean
}

interface JobApplication {
  _id: string
  jobId: string
  applicantId: string
  status: string
  coverLetter: string
  expectedSalary: number
  appliedAt: string
}

export const useJobPortal = () => {
  const [jobs, setJobs] = useState<Job[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch jobs with filters
  const fetchJobs = useCallback(async (filters?: any) => {
    setLoading(true)
    try {
      const response = await lumi.entities.jobs.list({
        filter: filters,
        sort: { createdAt: -1 }
      })

      // Type-safe mapping
      const jobsList: Job[] = (response.list || []).map((item: any) => ({
        _id: item._id,
        title: item.title,
        company: item.company,
        location: item.location,
        employmentType: item.employmentType,
        salaryMin: item.salaryMin,
        salaryMax: item.salaryMax,
        description: item.description,
        requirements: item.requirements,
        skills: item.skills,
        category: item.category,
        experienceLevel: item.experienceLevel,
        status: item.status,
        applicationDeadline: item.applicationDeadline,
        postedBy: item.postedBy,
        applicationsCount: item.applicationsCount,
        createdAt: item.createdAt,
      }))

      setJobs(jobsList)
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
      toast.error('Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch companies
const fetchCompanies = useCallback(async () => {
  setLoading(true)
  try {
    const response = await lumi.entities.companies.list({
      sort: { name: 1 }
    });

    // Map Lumi entities to our Company interface
    const companiesList: Company[] = (response.list || []).map((item: any) => ({
      _id: item._id,
      name: item.name,
      industry: item.industry,
      size: item.size,
      location: item.location,
      description: item.description,
      website: item.website || '',
      logo: item.logo || '',
      verified: item.verified || false
    }));

    setCompanies(companiesList);

  } catch (error) {
    console.error('Failed to fetch companies:', error);
    toast.error('Failed to load companies');
  } finally {
    setLoading(false)
  }
}, []);


  // Fetch user applications
  const fetchUserApplications = useCallback(async (userId: string) => {
    try {
      const response = await lumi.entities.job_applications.list({
        filter: { applicantId: userId },
        sort: { appliedAt: -1 }
      })

      // Type-safe mapping
      const applicationsList: JobApplication[] = (response.list || []).map((item: any) => ({
        _id: item._id,
        jobId: item.jobId,
        applicantId: item.applicantId,
        status: item.status,
        coverLetter: item.coverLetter,
        expectedSalary: item.expectedSalary,
        appliedAt: item.appliedAt,
      }))

      setApplications(applicationsList)
    } catch (error) {
      console.error('Failed to fetch applications:', error)
      toast.error('Failed to load applications')
    }
  }, [])

  // The rest of your hooks remain unchanged
 const createJob = async (jobData: Omit<Job, '_id' | 'applicationsCount' | 'createdAt'>) => {
  try {
    const newJobResponse = await lumi.entities.jobs.create({
      ...jobData,
      applicationsCount: 0,
      createdAt: new Date().toISOString()
    });

    // Map to Job type explicitly
    const newJob: Job = {
      _id: newJobResponse._id,
      title: newJobResponse.title,
      company: newJobResponse.company,
      location: newJobResponse.location,
      employmentType: newJobResponse.employmentType,
      salaryMin: newJobResponse.salaryMin,
      salaryMax: newJobResponse.salaryMax,
      description: newJobResponse.description,
      requirements: newJobResponse.requirements,
      skills: newJobResponse.skills,
      category: newJobResponse.category,
      experienceLevel: newJobResponse.experienceLevel,
      status: newJobResponse.status,
      applicationDeadline: newJobResponse.applicationDeadline,
      postedBy: newJobResponse.postedBy,
      applicationsCount: newJobResponse.applicationsCount,
      createdAt: newJobResponse.createdAt,
    };

    setJobs(prev => [newJob, ...prev]);
    toast.success('Job posted successfully');
    return newJob;
  } catch (error) {
    console.error('Failed to create job:', error);
    toast.error('Failed to post job');
    throw error;
  }
}


  const applyForJob = async (jobId: string, applicationData: {
    coverLetter: string
    expectedSalary: number
    applicantId: string
  }) => {
    try {
      const application = await lumi.entities.job_applications.create({
        jobId,
        ...applicationData,
        status: 'pending',
        appliedAt: new Date().toISOString()
      })

      const job = jobs.find(j => j._id === jobId)
      if (job) {
        await lumi.entities.jobs.update(jobId, {
          applicationsCount: job.applicationsCount + 1
        })
        setJobs(prev => prev.map(j => 
          j._id === jobId 
            ? { ...j, applicationsCount: j.applicationsCount + 1 }
            : j
        ))
      }

      toast.success('Application submitted successfully')
      return application
    } catch (error) {
      console.error('Failed to apply for job:', error)
      toast.error('Failed to submit application')
      throw error
    }
  }

  const updateApplicationStatus = async (applicationId: string, status: string, feedback?: string) => {
    try {
      const updates: any = { status, updatedAt: new Date().toISOString() }
      if (feedback) updates.feedback = feedback

      await lumi.entities.job_applications.update(applicationId, updates)
      setApplications(prev => prev.map(app => 
        app._id === applicationId 
          ? { ...app, ...updates }
          : app
      ))
      toast.success('Application status updated')
    } catch (error) {
      console.error('Failed to update application:', error)
      toast.error('Failed to update application status')
      throw error
    }
  }

  const getJobById = async (jobId: string) => {
    try {
      return await lumi.entities.jobs.get(jobId)
    } catch (error) {
      console.error('Failed to fetch job:', error)
      throw error
    }
  }

  const hasUserApplied = useCallback((jobId: string, userId: string) => {
    return applications.some(app => app.jobId === jobId && app.applicantId === userId)
  }, [applications])

  useEffect(() => {
    fetchJobs()
    fetchCompanies()
  }, [fetchJobs, fetchCompanies])

  return {
    jobs,
    companies,
    applications,
    loading,
    fetchJobs,
    fetchCompanies,
    fetchUserApplications,
    createJob,
    applyForJob,
    updateApplicationStatus,
    getJobById,
    hasUserApplied
  }
}
