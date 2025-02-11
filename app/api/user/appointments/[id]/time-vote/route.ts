import { NextResponse } from "next/server";
import { SbAppointmentRepository } from "@/infrastructure/repositories/SbAppointmentRepository";
import { DfGetAppointmentTimeUsecase } from "@/application/usecases/vote/DfGetAppointmentTimeUsecase.ts";

export const GET = async (
  req: NextResponse,
  { params }: { params: { id: number } }
) => {
  const repository = new SbAppointmentRepository();
  const usecase = new DfGetAppointmentTimeUsecase(repository);
  const { id } = await params;
  const appointmentTime = await usecase.execute(id);

  if (!appointmentTime) {
    return NextResponse.json(
      { error: "Appointment not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(appointmentTime);
};
