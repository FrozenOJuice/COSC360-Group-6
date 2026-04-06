function normalizeDate(value) {
    if (!value) {
        return null;
    }

    if (value instanceof Date) {
        return value.toISOString();
    }

    return String(value);
}

export function toJobDto(job, options = {}) {
    const dto = {
        id: job.id ?? String(job._id),
        title: job.title,
        category: job.category,
        country: job.country,
        salary: job.salary,
        currency: job.currency,
        createdAt: normalizeDate(job.createdAt),
        updatedAt: normalizeDate(job.updatedAt),
        applicantIds: (job.applicantIds ?? []).map(String),
    };

    if (options.includeEmployerUserId) {
        dto.employerUserId = job.employerUserId ? String(job.employerUserId) : null;
    }

    return dto;
}
