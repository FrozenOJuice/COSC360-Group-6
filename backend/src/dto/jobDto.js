export function toJobDto(job) {
    return {
        id: job.id ?? String(job._id),
        title: job.title,
        category: job.category,
        country: job.country,
        salary: job.salary,
        currency: job.currency,
        exchangeRate: job.exchangeRate,
    };
}
