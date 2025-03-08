import { getRepository } from "typeorm";
import { Feedback, FeedbackType } from "../entities/Feedback";

export interface CreateFeedbackParams {
  bookId: number;
  userId: number;
  comment: string;
  rating?: number;
  type: FeedbackType;
}

export interface UpdateFeedbackParams {
  comment?: string;
  rating?: number;
  type?: FeedbackType;
}

export class FeedbackService {
  async createFeedback(params: CreateFeedbackParams): Promise<Feedback> {
    const feedbackRepository = getRepository(Feedback);
    const feedback = feedbackRepository.create({
      bookId: params.bookId,
      userId: params.userId,
      comment: params.comment,
      rating: params.rating,
      type: params.type,
    });

    return await feedbackRepository.save(feedback);
  }

  async getAllFeedbacks(
    skip: number = 0,
    take: number = 10
  ): Promise<Feedback[]> {
    const feedbackRepository = getRepository(Feedback);
    return await feedbackRepository.find({
      skip,
      take,
    });
  }

  async getFeedbackById(id: number): Promise<Feedback> {
    const feedbackRepository = getRepository(Feedback);
    const feedback = await feedbackRepository.findOne({ where: { id } });

    if (!feedback) {
      throw new Error(`Feedback with ID ${id} not found`);
    }

    return feedback;
  }

  async getFeedbackByBookId(bookId: number): Promise<Feedback[]> {
    const feedbackRepository = getRepository(Feedback);
    return await feedbackRepository.find({ where: { bookId } });
  }

  async updateFeedback(
    id: number,
    params: UpdateFeedbackParams
  ): Promise<Feedback> {
    const feedbackRepository = getRepository(Feedback);
    const feedback = await this.getFeedbackById(id);

    if (params.comment !== undefined) feedback.comment = params.comment;
    if (params.rating !== undefined) feedback.rating = params.rating;
    if (params.type !== undefined) feedback.type = params.type;

    return await feedbackRepository.save(feedback);
  }

  async deleteFeedback(id: number): Promise<boolean> {
    const feedbackRepository = getRepository(Feedback);
    const feedback = await this.getFeedbackById(id);
    await feedbackRepository.remove(feedback);
    return true;
  }

  async verifyFeedback(id: number): Promise<Feedback> {
    const feedbackRepository = getRepository(Feedback);
    const feedback = await this.getFeedbackById(id);
    feedback.isVerified = true;
    return await feedbackRepository.save(feedback);
  }
}
