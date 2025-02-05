import { DfAppointmentCardUsecase } from "@/application/usecases/appointment/DfGetAppointmentCardUsecase";
import { SbAppointmentRepository } from "@/infrastructure/repositories/SbAppointmentRepository";
import { SbMemberRepository } from "@/infrastructure/repositories/SbMemberRepository";
import { SbUserRepository } from "@/infrastructure/repositories/SbUserRepository";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("userId"); 

    const userRepository = new SbUserRepository();
    const memberRepository = new SbMemberRepository();
    const appointmentRepository = new SbAppointmentRepository();

    const usecase = new DfAppointmentCardUsecase(
      userRepository,
      memberRepository,
      appointmentRepository
    );

    if (!id) {
      throw new Error("userId is required");
    }

    const appointments = await usecase.execute(id);

    if (!appointments || appointments.length === 0) {
      return NextResponse.json({ error: "No appointments found" }, { status: 404 });
    }

    return NextResponse.json(appointments);

  } catch (error) {
    console.error("❌ Error fetching appointments:", error);
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } // catch
}
