// image-upload.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class ImageUploadService {

  constructor(private http: HttpClient, private authService: AuthService) { }

  getUploadUri() {
    const token = this.authService.getToken();
    const headers = {
      Authorization: `Bearer ${token}`
    };
    return this.http.post<{ uploadUri: string }>(`https://api.theknight.tech/api/images/upload`, {}, { headers });
  }

  uploadFileToSasUrl(file: File, uploadUri: string) {
    const headers = {
      'x-ms-blob-type': 'BlockBlob',
      'Content-Type': file.type
    };

    return this.http.put(uploadUri, file, { headers, responseType: 'text' });
  }

}
