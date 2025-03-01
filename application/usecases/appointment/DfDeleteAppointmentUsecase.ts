import { AppointmentRepository } from "@/domain/repositories/AppointmentRepository";

export class DfDeleteAppointmentUsecase {
  constructor(private appointmentRepo: AppointmentRepository) {}

  async execute(appointmentId: number): Promise<boolean> {
    return await this.appointmentRepo.deleteAppointment(appointmentId);
  }
}
